<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <span style="font-size:20pt;">LOBO FILES</span>
      </div>

      <v-spacer></v-spacer>
      <v-btn
        v-if="authState === 'signedin' && user"
        color="blue-grey"
        class="ma-2 white--text"
        @click="sendAuditoria"
      >
        Log de auditoria
        <v-icon right dark>
          mdi-cloud-search
        </v-icon>
      </v-btn>
      <amplify-sign-out
        v-if="authState === 'signedin' && user"
        button-text="Logout"
      ></amplify-sign-out>
    </v-app-bar>

    <v-main>
      <amplify-authenticator
        :form-fields.prop="signUpFormFields"
        usernameAlias="email"
      >
        <div>
          <v-container>
            <v-row>
              <v-col>
                <v-flex sm6 offset-sm3>
                  <v-card
                    ><v-card-title>Envie um novo arquivo</v-card-title>
                    <v-file-input
                      accept="image/*"
                      color="deep-purple accent-4"
                      append-outer-icon="mdi-send"
                      label="File input"
                      placeholder="Select your files"
                      prepend-icon="mdi-paperclip"
                      @click:append-outer="upload"
                      v-model="uploadFile"
                    ></v-file-input>
                  </v-card>
                </v-flex>
              </v-col>
            </v-row>
          </v-container>
          <v-spacer></v-spacer>
          <v-container>
            <v-row>
              <v-col>
                <v-flex sm6 offset-sm3>
                  <v-card>
                    <v-toolbar color="cyan" dark>
                      <v-toolbar-title>Seus arquivos</v-toolbar-title>
                      <v-spacer></v-spacer>
                    </v-toolbar>
                    <template v-for="item in files">
                      <v-list-item :key="item.key">
                        <v-list-item-content>
                          <v-list-item-title
                            >{{ item.key }} -
                            {{ formatBytes(item.size, 2) }}</v-list-item-title
                          >
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-btn icon ripple>
                            <v-icon
                              color="darken-2"
                              @click="downloadFile(item.key)"
                            >
                              mdi-download
                            </v-icon>
                          </v-btn>
                        </v-list-item-action>
                        <v-list-item-action @click="deleteFile(item.key)">
                          <v-btn icon ripple>
                            <v-icon color="darken-2">
                              mdi-delete
                            </v-icon>
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                    </template>
                  </v-card>
                </v-flex>
              </v-col>
              <!-- </v-col> -->
            </v-row>
          </v-container>
        </div>
      </amplify-authenticator>
    </v-main>
  </v-app>
</template>

<script>
import { Storage, API, graphqlOperation } from "aws-amplify";
import { onAuthUIStateChange } from "@aws-amplify/ui-components";
import { createAuditoria } from "@/graphql/mutations";

const Swal = require("sweetalert2");
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  onOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export default {
  name: "App",
  created() {
    this.unsubscribeAuth = onAuthUIStateChange((authState, authData) => {
      this.authState = authState;
      this.user = authData;
      if (authState === "signedin") {
        this.getFiles();
      }
    });
  },
  components: {},
  methods: {
    formatBytes: function(bytes, decimals = 2) {
      if (bytes === 0) return "0 Bytes";

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    },
    async getFiles() {
      Swal.fire({
        title: "Carregando...",
        allowEscapeKey: false,
        allowOutsideClick: false,
        onOpen: () => {
          Swal.showLoading();
        },
      });

      Storage.list("", { level: "private" })
        .then((result) => {
          this.files = result;
          Swal.close();
        })
        .catch((err) => console.log(err));
    },
    async deleteFile(key) {
      Storage.remove(key, { level: "private" })
        .then(() => {
          API.graphql(
            graphqlOperation(createAuditoria, {
              input: {
                email: this.user.attributes.email,
                action: "DL",
                key: key,
              },
            })
          );
          Toast.fire({
            icon: "success",
            title: "File removed!",
          });
          this.getFiles();
        })
        .catch((err) => console.log(err));
    },
    upload: async function() {
      Swal.fire({
        title: "Carregando...",
        allowEscapeKey: false,
        allowOutsideClick: false,
        onOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        await Storage.put(this.uploadFile.name, this.uploadFile, {
          level: "private",
          contentType: this.uploadFile.type,
        }).then(() => {
          API.graphql(
            graphqlOperation(createAuditoria, {
              input: {
                email: this.user.attributes.email,
                action: "U",
                key: this.uploadFile.name,
              },
            })
          );
          Toast.fire({
            icon: "success",
            title: "File Uploaded!",
          });
          this.getFiles();
        });
      } catch (err) {
        console.error("Error uploading file: ", err);
      }
      this.uploadFile = null;
    },
    downloadFile: async function(key) {
      Swal.fire({
        title: "Carregando...",
        allowEscapeKey: false,
        allowOutsideClick: false,
        onOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        await Storage.get(key, {
          level: "private",
          download: false,
        }).then((response) => {
          window.open(response);
          Swal.close();
          API.graphql(
            graphqlOperation(createAuditoria, {
              input: {
                email: this.user.attributes.email,
                action: "DW",
                key: key,
              },
            })
          );
        });
      } catch (err) {
        console.error("Error downloading file: ", err);
      }
    },
    sendAuditoria: async function() {
      Swal.fire({
        title: "Carregando...",
        allowEscapeKey: false,
        allowOutsideClick: false,
        onOpen: () => {
          Swal.showLoading();
        },
      });
      await API.graphql(
        graphqlOperation(createAuditoria, {
          input: {
            email: this.user.attributes.email,
            action: "AU",
          },
        })
      ).then(() => {
        Swal.close();
        Toast.fire({
          icon: "success",
          title: "Foi enviado um email com o log de auditoria!",
        });
      });
    },
  },
  data: () => ({
    user: undefined,
    authState: undefined,
    unsubscribeAuth: undefined,
    files: [],
    uploadFile: null,
    signUpFormFields: [
      {
        type: "username",
        required: true,
      },
      {
        type: "email",
        required: true,
      },
      {
        type: "password",
        required: true,
      },
    ],
  }),
  beforeDestroy() {
    this.unsubscribeAuth();
  },
};
</script>

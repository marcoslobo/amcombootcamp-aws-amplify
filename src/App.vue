<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <span style="font-size:20pt;">LOBO FILES</span>
      </div>
      <!-- <center>
        <div v-if="authState === 'signedin' && user">
          <span> Hello {{ user.attributes.email }} </span>
        </div>
      </center> -->
      <v-spacer></v-spacer>
      <v-btn
        v-if="authState === 'signedin' && user"
        color="blue-grey"
        class="ma-2 white--text"
        @click="sendAuditoria"
      >
        Audit logs
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
      <br />
      <br />
      <amplify-authenticator username-alias="email">
        <amplify-sign-in
          slot="sign-in"
          :form-fields.prop="formFieldsSignIn"
        ></amplify-sign-in>
        <amplify-confirm-sign-in
          slot="confirm-sign-in"
        ></amplify-confirm-sign-in>
        <amplify-sign-up
          slot="sign-up"
          username-alias="email"
          :form-fields.prop="formFieldsSignUp"
        ></amplify-sign-up>

        <amplify-forgot-password
          slot="forgot-password"
          :form-fields.prop="formFieldsForgotPassword"
        ></amplify-forgot-password>
        <amplify-require-new-password
          slot="require-new-password"
        ></amplify-require-new-password>
        <div>
          <v-container>
            <v-row>
              <v-col>
                <v-flex sm6 offset-sm3>
                  <v-card
                    ><v-card-title>Send new File</v-card-title>
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
                    <v-toolbar color="#1976d2" dark>
                      <v-toolbar-title>Your Files</v-toolbar-title>
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
  position: "bottom-end",
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
      Storage.list("", { level: "private" })
        .then((result) => {
          this.files = result;
        })
        .catch((err) => console.log(err));
    },
    async deleteFile(key) {
      Swal.fire({
        title: "Loading...",
        allowEscapeKey: false,
        allowOutsideClick: false,
        onOpen: () => {
          Swal.showLoading();
        },
      });
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
          Swal.close();
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
        title: "Loading...",
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
          Swal.close();
          Toast.fire({
            icon: "success",
            title: "File uploaded",
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
        title: "Loading...",
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
        title: "Loading...",
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
          title: "Check your email",
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
    formFieldsSignIn: [
      {
        type: "email",
        label: "Email",
        placeholder: "Your email",
        inputProps: { required: true, autocomplete: "username" },
      },
      {
        type: "password",
        label: "Password",
        placeholder: "Safe password",
        inputProps: { required: true, autocomplete: "new-password" },
      },
    ],
    formFieldsSignUp: [
      {
        type: "email",
        label: "Email",
        placeholder: "Your email",
        inputProps: { required: true, autocomplete: "username" },
      },
      {
        type: "password",
        label: "Password",
        placeholder: "Your safe password",
        inputProps: { required: true, autocomplete: "new-password" },
      },
    ],
    formFieldsForgotPassword: [
      {
        type: "email",
        label: "Email",
        placeholder: "Seu email",
        inputProps: { required: true, autocomplete: "username" },
      },
    ],
  }),
  beforeDestroy() {
    this.unsubscribeAuth();
  },
};
</script>
<style scoped>
amplify-sign-in {
  position: absolute;
  top: 0;
  margin-top: 20px;
}
</style>

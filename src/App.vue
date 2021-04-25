<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />

        <v-img
          alt="Vuetify Name"
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
          width="100"
        />
      </div>

      <v-spacer></v-spacer>

      <amplify-sign-out
        v-if="authState === 'signedin' && user"
        button-text="Logout"
      ></amplify-sign-out>
    </v-app-bar>

    <v-main>
      <amplify-authenticator>
        <div>
          <v-container>
            <v-row>
              <v-col>
                <v-flex sm6 offset-sm3>
                  <v-card
                    ><v-card-title>Upload a new file</v-card-title>
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
                      <v-toolbar-title>Files</v-toolbar-title>
                      <v-spacer></v-spacer>
                    </v-toolbar>
                    <template v-for="item in files">
                      <v-list-item :key="item.key">
                        <v-list-item-content>
                          <v-list-item-title>{{ item.key }}</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-btn icon ripple>
                            <v-icon color="darken-2">
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
import { Storage } from "aws-amplify";
import { onAuthUIStateChange } from "@aws-amplify/ui-components";

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
    async getFiles() {
      console.log(this.user);

      Storage.list("", { level: "private" })
        .then((result) => (this.files = result))
        .catch((err) => console.log(err));
    },
    async deleteFile(key) {
      //console.log(key);
      // const todo = { acao: "TESTE", email: "teste@teste.com" };
      // const createdItem = await API.graphql(
      //   graphqlOperation(createTodo, {
      //     input: todo,
      //   })
      // );
      //console.log(createdItem);

      Storage.remove(key, { level: "private" })
        .then(this.getFiles())
        .catch((err) => console.log(err));
    },
    upload: async function() {
      // upload to s3
      try {
        console.log(this.uploadFile);
        await Storage.put(this.uploadFile.name, this.uploadFile, {
          level: "private",
          contentType: this.uploadFile.type,
        }).then(() => this.getFiles());
      } catch (err) {
        console.error("Error uploading file: ", err);
      }
      this.uploadFile = null;
    },
  },
  data: () => ({
    user: undefined,
    authState: undefined,
    unsubscribeAuth: undefined,
    files: [],
    uploadFile: null,
  }),
  beforeDestroy() {
    this.unsubscribeAuth();
  },
};
</script>

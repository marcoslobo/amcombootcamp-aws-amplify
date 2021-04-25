<template>
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
</template>

<script>
import { Storage } from "aws-amplify";

export default {
  name: "App",
  props: ["user"],
  created() {
    this.getFiles();
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
  mounted() {
    this.getFiles();
  },
  data() {
    return {
      files: [],
      uploadFile: null,
    };
  },
};
</script>

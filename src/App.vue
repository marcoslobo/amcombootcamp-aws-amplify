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
        <Album :user="this.user" />
      </amplify-authenticator>
    </v-main>
  </v-app>
</template>

<script>
import Album from "./components/Album";
import { onAuthUIStateChange } from "@aws-amplify/ui-components";

export default {
  name: "App",
  created() {
    this.unsubscribeAuth = onAuthUIStateChange((authState, authData) => {
      this.authState = authState;
      this.user = authData;
    });
  },
  components: {
    Album,
  },
  methods: {
    async fhandleAuthStateChange(state) {
      console.log(state);
      console.log("af");
    },
  },
  data: () => ({
    user: undefined,
    authState: undefined,
    unsubscribeAuth: undefined,
  }),
  beforeDestroy() {
    this.unsubscribeAuth();
  },
};
</script>

<template>
  <div class="title">
    <h1 class="upper">AutoLogin</h1>
    <h2>in die Onlineportale der TU Dresden</h2>
  </div>
  <div class="inputs">
    <CustomInput
      v-model="username"
      v-model:valid="usernameValid"
      :placeholder="zihLogin.usernamePlaceholder"
      :pattern="zihLogin.usernamePattern"
      :error-message="zihLogin.usernameError"
      :column="true"
      warn
    />
    <CustomInput
      v-model="password"
      v-model:valid="passwordValid"
      :pattern="zihLogin.passwordPattern"
      :placeholder="zihLogin.passwordPlaceholder"
      type="password"
      :error-message="zihLogin.passwordError"
      :column="true"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";

// components
import Input from "../components/Input.vue";

// composables
import { useUserData } from "../composables/user-data";
import { useStepper } from "../composables/stepper";
import { useLogins } from "../composables/logins";

export default defineComponent({
  components: {
    //    Onboarding,
    CustomInput: Input,
  },
  setup() {
    const { stepWidth } = useStepper();
    const { saveUserData } = useUserData();
    const { logins } = useLogins();
    const zihLogin = logins[0];
    const username = ref("");
    const password = ref("");
    const usernameValid = ref(false);
    const passwordValid = ref(false);

    // jump next step if ready was never set to true
    stepWidth.value = 2;

    const ready = computed(() => usernameValid.value && passwordValid.value);

    watch(ready, async () => {
      if (ready.value === true) {
        await saveUserData(username.value, password.value, "zih");
        stepWidth.value = 1;
      } else {
        stepWidth.value = 2;
      }
    });

    return { username, password, usernameValid, passwordValid, zihLogin };
  },
});
</script>

<style lang="sass" scoped>
.title
    display: flex
    flex-direction: column
    align-items: center
.inputs
    display: flex
    flex-direction: column
    align-items: center
    gap: .8rem
.info
    margin-top: .8rem
    width: 70%
    display: flex
    justify-content: space-between
    align-items: center
</style>

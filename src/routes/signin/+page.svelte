<script lang="ts">
    import { goto } from '$app/navigation';
    const switchToSignUp = () => {
      goto('/signup');
    };
    const handleSubmit = (event: SubmitEvent) => {
      event.preventDefault();
      const { username, password } = event.target as HTMLFormElement;
      console.log('Sign In:', (username as HTMLInputElement).value, (password as HTMLInputElement).value);
    };
  </script>
  <style>
    @import '../../styles/basicstyles.css';
  </style>
  <div class="auth-container">
    <h2>Sign In</h2>
    <form on:submit={handleSubmit}>
      <input type="text" placeholder="Username" name="username" required />
      <input type="password" placeholder="Password" name="password" required />
      <button type="submit">Sign In</button>
    </form>
    <div class="switch">
      <p>Don't have an account?</p>
      <a href="javascript:void(0)" on:click={switchToSignUp}>Sign Up</a>
    </div>
  </div>
  
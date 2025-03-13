<script lang="ts">
    import { goto } from '$app/navigation';
    const switchToSignIn = () => {
      goto('/signin');
    };
    const handleSubmit = (event: SubmitEvent) => {
      event.preventDefault();
      const { username, password, confirmPassword } = event.target as HTMLFormElement;
      if ((password as HTMLInputElement).value !== (confirmPassword as HTMLInputElement).value) {
        alert('Passwords do not match!');
        return;
      }
      console.log('Sign Up:', (username as HTMLInputElement).value, (password as HTMLInputElement).value);
    };
  </script>
  <style>
    @import '../../styles/basicstyles.css';
  </style>
  <div class="auth-container">
    <h2>Sign Up</h2>
    <form on:submit={handleSubmit}>
      <input type="text" placeholder="Username" name="username" required />
      <input type="password" placeholder="Password" name="password" required />
      <input type="password" placeholder="Confirm Password" name="confirmPassword" required />
      <button type="submit">Sign Up</button>
    </form>
    <div class="switch">
      <p>Already have an account?</p>
      <a href="javascript:void(0)" on:click={switchToSignIn}>Sign In</a>
    </div>
  </div>
  
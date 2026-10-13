export default function Login() {
  return (
    <main>
      <h1>Wesal</h1>
      <h2>Login</h2>
      <form onSubmit={(event) => event.preventDefault()}>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    name="email"
    type="email"
    autoComplete="email"
    required
  />
  <div>
  <label htmlFor="password">Password</label>
  <input
    id="password"
    name="password"
    type="password"
    autoComplete="current-password"
    required
  />
</div>
<button type="submit">Login</button>
</form>
    </main>
  )
}
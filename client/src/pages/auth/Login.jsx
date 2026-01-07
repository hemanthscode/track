import { LoginForm } from '../../components/forms/LoginForm.jsx'

const Login = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/70 via-background p-8">
    <div className="w-full max-w-lg space-y-8">
      <div className="text-center space-y-4 backdrop-blur-xl bg-background/80 p-12 rounded-3xl shadow-2xl border border-border/30">
        <div className="mx-auto h-28 w-28 bg-gradient-to-r from-primary via-accent to-primary/60 rounded-3xl flex items-center justify-center shadow-2xl mb-8 border-4 border-white/20">
          <span className="text-5xl font-black text-primary-foreground drop-shadow-lg">$</span>
        </div>
        <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
          Track
        </h1>
        <p className="text-2xl text-muted-foreground font-semibold tracking-wide">Your expense manager</p>
      </div>
      
      <div className="max-w-md mx-auto">
        <LoginForm />
      </div>
    </div>
  </div>
)

export { Login }

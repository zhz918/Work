import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar } from '@material-ui/core';
import { Link, useHistory } from "react-router-dom"
import firebase from '../Firebase/firebase.js'



const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://images.unsplash.com/photo-1603919047349-32c294eb6dc4?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(4, 8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  heyThere: {
    fontWeight: 'bold',
    fontSize: '24px'
    },
  subtitle: {
    fontSize: '14px',
    color: 'orange'
  }

}));

export default function Login() {

  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)

  const history = useHistory();

  const classes = useStyles();

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  //useEffect checks to see if the user has selected the Remember Me option before if so then update the
  //input fields with those values
  useEffect(() => {
    if (localStorage.rememberMe) {
      setEmail(localStorage.email)
      setPassword(localStorage.password)
      const rememberMeLocal = (localStorage.rememberMe === 'true')
      setRememberMe(rememberMeLocal)
    }
  }, [])

  async function handleSubmit(e) {

    e.preventDefault()

    try {
      await firebase.auth().signInWithEmailAndPassword(email, password)
      if (firebase.auth().currentUser.emailVerified) {
        if (rememberMe) {
          localStorage.email = email
          localStorage.password = password
          localStorage.rememberMe = rememberMe
        }
        history.push('/Dashboard')
      } else {
        alert("You must verify your email before you login!")
      }
    } catch (e) {
      alert(e.message);
    }

  }

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed">
          <Toolbar>
            <Button 
            color="inherit"
            component={Link} 
            to={'./'}
            >
              Home
            </Button>
          </Toolbar>
        </AppBar>
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item container xs={12} sm={8} md={5} component={Paper} elevation={6} square direct="column">
        <Grid item xs={12} sm={8} md={5} />
        <div className={classes.paper}>
          <Typography component="h1" className={classes.heyThere}>
            Hey There!
          </Typography>
          <Typography component='h2' className={classes.subtitle}>
            Do what you love and do it often.
          </Typography>
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <FormControlLabel
              control={<Checkbox checked={rememberMe} value="remember" color="primary" onChange={() => setRememberMe(!rememberMe)} />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link to={"./ResetPassword"}>
                  {"Forgot password?"}
                </Link>
              </Grid>
              <Grid item>
                <Link to={"./Registration"}>
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Grid>
    </Grid>
  );
}
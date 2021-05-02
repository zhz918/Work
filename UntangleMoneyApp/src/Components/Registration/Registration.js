import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Link, useHistory } from "react-router-dom";
import firebase from '../Firebase/firebase.js';
import { AppBar, Toolbar } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function Registration() {
  
    const classes = useStyles();

    const history = useHistory();

    const [firstName, setFirstName] = useState("")
    const [email , setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    async function handleSubmit(event) {

        event.preventDefault()

        try {

            if (password !== confirmPassword) {
                alert("Please make sure passwords are the same!")
            } else {
                
                if (validNameInput(firstName)) {
                  alert("Enter a valid first name")
                  return
                }

                await firebase.auth().createUserWithEmailAndPassword(email, password).then(
                    function() {
                        console.log("account successfully created")
                    }
                )
    
                const currentUser = firebase.auth().currentUser
    
                if (currentUser != null) {

                  await currentUser.updateProfile({
                      displayName: firstName
                  }).then(function() {
                      console.log('name update successful')
                  })

                  await currentUser.sendEmailVerification()
                  .then(function() {
                    console.log("email verification successfully sent")
                  }).catch(error => {
                    console.log(error)
                  })
                }
                
                history.push('/InfoInput')
            
            }


        } catch (e) {
            alert(e.message);
        }
    }


    function validNameInput(name) {

      const validRegex = new RegExp("^[a-z ,.'-]+$", "gi")

      if (name === '') {
        return false
      } else {
        return !name.match(validRegex)
      }

    }

  return (
    <Container component="main" maxWidth="xs">
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
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} />
            <Grid item xs={12}>
              <TextField
                autoComplete="fname"
                name="firstName"
                variant="outlined"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                error={validNameInput(firstName)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="current-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign Up
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            component={Link}
            to={'./'}
          >
            Already have an account? Sign in
          </Button>
        </form>
      </div>
    </Container>
  );
}
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
import { Link } from "react-router-dom"
import firebase from '../Firebase/firebase.js'
import Snackbar from '@material-ui/core/Snackbar';

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

  alignText : {
      textAlign: 'center'
  }
}));

export default function SignUp() {
    
    const classes = useStyles();

    const [email, setEmail] = useState(null)
    const [snackbarState, setSnackBarState] = useState({open: false, vertical: 'top', horizontal: 'center'})
    const auth = firebase.auth()
    const {vertical, horizontal, open} = snackbarState

    function handleSubmit(e) {

        e.preventDefault();
        auth.sendPasswordResetEmail(email).then(
            () => {setSnackBarState({open: true, vertical, horizontal})}
        )

    }

    return (
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            <Snackbar 
            anchorOrigin={{vertical, horizontal}}
            open={open}
            autoHideDuration={5000}
            message="Reset Password Email Sent!"
            key={vertical + horizontal}
            />
            <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
            Forgot your Password?
            </Typography>
            <form className={classes.form} noValidate onSubmit={e => handleSubmit(e)}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                        <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        placeholder="Please enter your email to reset password"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        />
                    </Grid>
                    <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    >
                        Reset Password
                    </Button>
                    <Grid item xs={12}>
                        <Link to={"./"}>
                            Already have an account? Sign in
                        </Link>
                    </Grid>
                </Grid>
            </form>
        </div>
        </Container>
    );
}
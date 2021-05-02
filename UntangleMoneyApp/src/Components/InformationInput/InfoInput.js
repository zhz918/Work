import React, { useState } from 'react';
import { useHistory } from "react-router-dom"
import firebase from '../Firebase/firebase.js'
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import InfoIcon from '@material-ui/icons/Info'
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { Input, InputAdornment, MenuItem, Select} from '@material-ui/core';


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
      width: '100%',
      marginTop: theme.spacing(3),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  }));

export default function InfoInput() {

    const history = useHistory();
    const classes = useStyles()

    //Fields for all the User's Info
    const [age, setAge] = useState('')
    const [currentSavings, setCurrentSavings] = useState('')
    const [income, setIncome] = useState('')
    const [incomePer, setIncomePer] = useState('/year')
    const [lifeHappensSavings, setLifeHappensSavings] = useState('')
    const [committedMoney, setCommittedMoney] = useState('')
    const [committedMoneyPer, setCommittedMoneyPer] = useState('/year')

    async function handleSubmit(e) {

        e.preventDefault()

        const curUser = firebase.auth().currentUser
        const curDatabase = firebase.database()

        if (!validAgeInput(age)
        || !validMoneyInput(income)
        || !validMoneyInput(currentSavings)
        || !validMoneyInput(lifeHappensSavings)
        || !validMoneyInput(committedMoney)) {
          alert("Invalid Inputs, please enter valid values!")
          return
        }

        const baselineInfo = {
            age: age,
            incomeObj: income * (incomePer === "/year" ? 1 : 1/12),
            currentSavings: currentSavings,
            lifeHappensSavings: lifeHappensSavings,
            committedMoneyObj: committedMoney * (committedMoneyPer === "/year" ? 1 : 1/12),
            incomePer: incomePer,
            committedMoneyPer: committedMoneyPer
        }

        await curDatabase.ref('users/' + curUser.uid).set( {
            baselineInfo: baselineInfo,
            financialScenarios: {scenarioA: []}
        })

        history.push('/Dashboard')

    }

    function validAgeInput(age) {
      const validRegex = new RegExp('^[1-9][0-9]*$');
      return (age === '' ? true : age.match(validRegex));
    }

    function validMoneyInput(money) {
      const validRegex = new RegExp('^(\\d+)$|^(\\d+\\.\\d{2})$')
      return (money === '' ? true : money.match(validRegex));
    }

    function validLifeHappensInput(savings) {
      return (savings === '' ? true : validMoneyInput(savings) && parseFloat(savings) <= parseFloat(currentSavings));
    }

    return(
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <InfoIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Your Financial Baseline
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
                <Typography align="left">Age: </Typography>
            </Grid>
            <Grid item xs={9}>
              <Input
              required
              fullWidth
              value={age}
              onChange={e => setAge(e.target.value)}
              error={!validAgeInput(age)}
              />
            </Grid>
            <Grid item xs={3}>
                <Typography align="left">Income: </Typography>
            </Grid>
            <Grid item xs={9}>
                <Input
                required
                fullWidth
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                endAdornment={<Select
                                value={incomePer}
                                onChange={e => setIncomePer(e.target.value)}
                                >
                                    <MenuItem value={'/year'}>/year</MenuItem>
                                    <MenuItem value={'/month'}>/month</MenuItem>
                                </Select>}
                value={income}
                onChange={e => setIncome(e.target.value)}
                error={!validMoneyInput(income)}
                />
            </Grid>
            <Grid item xs={3}>
                <Typography align="left">Current Savings: </Typography>
            </Grid>
            <Grid item xs={9}>
                <Input
                required
                fullWidth
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                value={currentSavings}
                onChange={e => setCurrentSavings(e.target.value)}
                error={!validMoneyInput(currentSavings)}
                />
            </Grid>
            <Grid item xs={3}>
                <Typography align="left">Life Happens Savings: </Typography>
            </Grid>
            <Grid item xs={9}>
                <Input
                required
                fullWidth
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                value={lifeHappensSavings}
                onChange={e => setLifeHappensSavings(e.target.value)}
                error={!validLifeHappensInput(lifeHappensSavings)}
                />
            </Grid>
            <Grid item xs={3}>
                <Typography align="left">Recurring Costs: </Typography>
            </Grid>
            <Grid item xs={9}>
                <Input
                required
                fullWidth
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                endAdornment={<Select
                                value={committedMoneyPer}
                                onChange={e => setCommittedMoneyPer(e.target.value)}
                                >
                                    <MenuItem value={'/year'}>/year</MenuItem>
                                    <MenuItem value={'/month'}>/month</MenuItem>
                                </Select>}
                value={committedMoney}
                onChange={e => setCommittedMoney(e.target.value)}
                error={!validMoneyInput(committedMoney)}
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
            Continue
          </Button>
        </form>
      </div>
    </Container>
    )
}

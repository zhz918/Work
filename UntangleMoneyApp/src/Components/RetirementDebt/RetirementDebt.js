import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useLocation } from 'react-router-dom';
import firebase from '../Firebase/firebase.js';
import { AppBar, Button, Card, CardContent, Grid, MenuItem, Select,
    Slider, Table, TableBody, TableCell, TableRow, Toolbar,
    Typography } from '@material-ui/core';
import { ExitToApp } from '@material-ui/icons';
import DebtCalc from '../Calculations/DebtCalc.js';
import FutureMoneyGraph from '../FutureMoneyGraph/FutureMoneyGraph.js';
import NowMoneyGraph from '../NowMoneyGraph/NowMoneyGraph.js';
import FlexCalc from "../Calculations/FlexCalc.js";
import RetirementSaving from "../Calculations/RetirementSaving.js"

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: '#F5F5F5',
        height: '1000px'
    },
    logout: {
        right: "5px",
        top: "5",
        position: "absolute"
    },
    welcomeStatement: {
        marginTop: "15px"
    },
    cardWidth: {
        width: '100%',
        minHeight: '100px'
    },
    slider: {
        marginTop: '50px'
    },
    sliderInput: {
        marginLeft: '10px'
    },
    snowballAvalanche: {
        marginLeft: '10px'
    }
}))

export default function RetirementDebt(props) {
    const location = useLocation()

    var age = parseFloat(location.state.age);
    var income = parseFloat(location.state.income);
    var debt = location.state.debt;
    var committedMoneyObj = parseFloat(location.state.committedMoneyObj);
    var lifeHappens = parseFloat(location.state.lifeHappens);
    var savingsGoal = parseFloat(location.state.savingsGoal);
    var retirementContributions = parseFloat(location.state.retirementContributions);
    var noDebtAge = age;

    var retirementCalcs = RetirementSaving(parseInt(age), 65, 95, 0.02, 0.045,
    0.03, committedMoneyObj, 1, income * 0.22, 1286.34, 0.22, 0)
    var retirementTarget = parseFloat(retirementCalcs[0].toFixed(2))
    var retirementContributions = parseFloat(retirementCalcs[1].toFixed(2))

    var minAndFlex = FlexCalc(income, debt, lifeHappens, committedMoneyObj,
        savingsGoal, retirementContributions);
    var sumMinDebtPayment = parseFloat(minAndFlex[0].toFixed(2));
    var flexMoney = parseFloat(minAndFlex[1].toFixed(2));

    const classes = useStyles()
    const history = useHistory()

    const [curUser, setCurUser] = useState(null)

    //Fields required for the debt and retirement sliders and choosing snowball vs avalanche
    const [sliderValueDebt, setSliderValueDebt] = useState(0)
    const [sliderValueRetirement, setSliderValueRetirement] = useState(0)
    const [snowballAvalanche, setSnowballAvalanche] = useState('snowball')



    const [newCalcValue, setnewCalcValue] = useState(DebtCalc(debt,
        snowballAvalanche, sumMinDebtPayment));

    var dynamicFlex = flexMoney - sliderValueDebt - sliderValueRetirement

    //Initializes the future money data
    var futureMoneyData = []
    const YEAR = new Date().getFullYear()
    var currentYear = YEAR;
    var currentContributions = 0;
    var currentTotal = 0;
    var finishedPayingDebt = false;
    var noDebtAge = 65;
    for (var i = age; i <= 65; i++) {
        if (!finishedPayingDebt) {
            var totalYearDebt = 0;
            for (var j = 0 ; j < Object.keys(newCalcValue).length; j++) {
                var periodInfo = newCalcValue[Object.keys(newCalcValue)[j]][
                    "periodInfo"];
                if (Object.keys(periodInfo).includes((currentYear - YEAR).toString(10))) {
                    totalYearDebt += periodInfo[(currentYear - YEAR).toString(10)]["balance"];
                }
            }
            if (totalYearDebt <= 0) {
                finishedPayingDebt = true;
                noDebtAge = currentYear - YEAR + age;
                futureMoneyData.push({"Year": currentYear, "Value": 0, "Type": "Debt"});
                futureMoneyData.push({"Year": currentYear, "Value": 0, "Type": "Contribution"});
                futureMoneyData.push({"Year": currentYear, "Value": 0, "Type": "Interest"});
            } else {
                futureMoneyData.push({"Year": currentYear, "Value": -totalYearDebt, "Type": "Debt"});
            }
        } else {
            currentContributions += parseFloat((retirementContributions + sliderValueRetirement).toFixed(2));
            currentTotal += parseFloat((retirementContributions + sliderValueRetirement).toFixed(2));
            currentTotal = currentTotal * 1.045;
            futureMoneyData.push({"Year": currentYear, "Value": currentContributions, "Type": "Contribution"});
            futureMoneyData.push({"Year": currentYear, "Value": currentTotal - currentContributions, "Type": "Interest"});
        }
        currentYear++;
    }

    var retirementSavingsChartDynamic = retirementSavingsChartCalc(
        parseInt(noDebtAge), 0, retirementContributions + sliderValueRetirement)
    var defaultRetirementSavingsChart = retirementSavingsChartCalc(
        parseInt(noDebtAge), 0, retirementContributions)

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            setCurUser(user)
        } else {
            console.log("there isn't a user")
        }
    });

    const nowMoneyData = [
        {"Use": "Budget", "Type": "Flex Money", "Amount": parseFloat(dynamicFlex.toFixed(2))},
        {"Use": "Budget", "Type": "Savings Goal", "Amount": parseFloat(location.state.savingsGoal)},
        {"Use": "Budget", "Type": "Additional Debt Payments", "Amount": parseFloat(sliderValueDebt.toFixed(2))},
        {"Use": "Budget", "Type": "Recurring Costs", "Amount": parseFloat(committedMoneyObj)},
        {"Use": "Budget", "Type": "Minimum Debt Payments", "Amount": sumMinDebtPayment},
        {"Use": "Budget", "Type": "Retirement Contributions", "Amount": retirementContributions + parseFloat(sliderValueRetirement)}];


    function handleBack() {
        history.push('/Dashboard')
    }

    function handleLogout() {
        if (curUser) {
            firebase.auth().signOut()
        }

        history.push('/')
    }

    function retirementSavingsChartCalc(ageInput, retirementSavings, retirementContributions) {
        var intAge = parseInt(ageInput)
        var retirementSavingsChart = {}
        retirementSavingsChart[intAge] = parseFloat(retirementSavings);

        for (var i = intAge + 1; i < 70; i++) {
            retirementSavingsChart[i] = parseFloat((retirementSavingsChart[i - 1] * 1.045 + retirementContributions).toFixed(2))
        }

        return retirementSavingsChart
    }

    const handleSliderChangeDebt = (event, newValue) => {
        setSliderValueDebt(newValue)
        setnewCalcValue(DebtCalc(debt, snowballAvalanche, sumMinDebtPayment + newValue))
    }

    const handleSliderChangeRetirement = (event, newValue) => {
        setSliderValueRetirement(newValue)
        // setnewMonthlyValue(RetirementSaving(parseInt(age), 65, 95, 0.02, 0.045, 0.03, commitedMoneyMonthly, 1, incomeMonthly * 0.22, 1286.34, 0.22, parseFloat(retirementSavings) + parseFloat(newValue))[1]);
    }

    return(
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Button color="inherit" onClick={() => handleBack()}>Back</Button>
                    <Button className={classes.logout} color="inherit" startIcon={<ExitToApp />} onClick={() => handleLogout()}>Logout</Button>
                </Toolbar>
            </AppBar>
            <Grid container spacing={2} direction="row">
                <Grid item xs={12}>
                    <Typography align="center" className={classes.welcomeStatement}>
                        Debt and Retirement Scheduling Journey!
                    </Typography>
                </Grid>
                <Grid container item xs={12} lg={6}>
                    <Card variant="outlined" className={classes.cardWidth}>
                        <CardContent>
                            <Grid container item xs={12} spacing={4} direction="column">
                                <Grid item container xs={12}>
                                    <Grid item xs={12}>
                                        <Typography>Remaining Flex Money: ${parseFloat(dynamicFlex.toFixed(2)) < 1 ? 0 : dynamicFlex.toFixed(2)}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography>
                                            Additional Debt Payments:
                                            <Select
                                            className={classes.snowballAvalanche}
                                            labelId="snowballAvalanche"
                                            id="snowballAvalanche"
                                            value={snowballAvalanche}
                                            onChange={e => setSnowballAvalanche(e.target.value)}
                                            >
                                                <MenuItem value={'snowball'}>Snowball</MenuItem>
                                                <MenuItem value={'avalanche'}>Avalanche</MenuItem>
                                            </Select>
                                        </Typography>
                                    </Grid>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs>
                                            <Slider
                                            className={classes.slider}
                                            value={typeof sliderValueDebt === 'number' ? sliderValueDebt : 0}
                                            onChange={handleSliderChangeDebt}
                                            valueLabelDisplay="on"
                                            max={parseInt((flexMoney * 0.85)-sliderValueRetirement)}
                                            min={0}
                                            />
                                        </Grid>
                                   </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell><Typography>Debt Name</Typography></TableCell>
                                                {Object.keys(newCalcValue).map((key) => (
                                                    <TableCell>
                                                        {key}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><Typography>Total Interest Paid:</Typography></TableCell>
                                                {Object.keys(newCalcValue).map((key) => (
                                                    <TableCell>
                                                        ${(Math.round(newCalcValue[key]["totalInterestPaid"] * 100 + Number.EPSILON)/100).toFixed(2)}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><Typography>Payoff Years</Typography></TableCell>
                                                {Object.keys(newCalcValue).map((key) => (
                                                    <TableCell>
                                                        {newCalcValue[key]["date"]}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><Typography>Minimum Payment Applied</Typography></TableCell>
                                                {Object.keys(newCalcValue).map((key) => (
                                                    <TableCell>
                                                        ${(Math.round(newCalcValue[key]["minApplied"] * 100 + Number.EPSILON) / 100).toFixed(2)}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Card className={classes.cardWidth}>
                        <CardContent>
                            <div id="FutureMoney">
                                <FutureMoneyGraph data={futureMoneyData} />
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid container item xs={12} lg={6}>
                    <Card variant="outlined" className={classes.cardWidth}>
                        <CardContent>
                            <Grid container item xs={12} spacing={4} direction="column">
                                <Grid item xs={12}>
                                    <Typography>Remaining Flex Money: ${parseFloat(dynamicFlex.toFixed(2)) < 1 ? 0 : dynamicFlex.toFixed(2)}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography align="left">Retirement Target Savings: ${defaultRetirementSavingsChart["64"]} contributing ${retirementContributions}/year</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography align="left">Potential Retirement Savings: ${retirementSavingsChartDynamic["64"]} contributing ${(retirementContributions + sliderValueRetirement).toFixed(2)}/year</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography>Additional Retirement Savings Contributions:</Typography>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs>
                                            <Slider
                                            className={classes.slider}
                                            value={typeof sliderValueRetirement === 'number' ? sliderValueRetirement : 0}
                                            onChange={handleSliderChangeRetirement}
                                            valueLabelDisplay="on"
                                            max={parseInt((flexMoney * 0.85)-sliderValueDebt)}
                                            min={0}
                                            />
                                        </Grid>
                                   </Grid>
                                    <Grid item xs={12}>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell><Typography>Age</Typography></TableCell>
                                                {Object.keys(defaultRetirementSavingsChart).map((key) => {
                                                    if (parseInt(key) < parseInt(noDebtAge) + 5) {
                                                        return (<TableCell>
                                                            {key}
                                                        </TableCell>)
                                                    }
                                                })}
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><Typography>Regular Retirement Balance:</Typography></TableCell>
                                                {Object.keys(defaultRetirementSavingsChart).map((key) => {
                                                    if (parseInt(key) < parseInt(noDebtAge) + 5) {
                                                        return (<TableCell>
                                                            ${defaultRetirementSavingsChart[key].toFixed(2)}
                                                        </TableCell>)
                                                    }
                                                })}
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><Typography>Potential Retirement Balance</Typography></TableCell>
                                                {Object.keys(defaultRetirementSavingsChart).map((key) => {
                                                    if (parseInt(key) < parseInt(noDebtAge) + 5) {
                                                        return (<TableCell>
                                                            ${retirementSavingsChartDynamic[key].toFixed(2)}
                                                        </TableCell>)
                                                    }
                                                })}
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><Typography>Additional Retirement Benefits</Typography></TableCell>
                                                {Object.keys(defaultRetirementSavingsChart).map((key) => {
                                                    if (parseInt(key) < parseInt(noDebtAge) + 5) {
                                                        return (<TableCell>
                                                            ${(retirementSavingsChartDynamic[key] - defaultRetirementSavingsChart[key]).toFixed(2)}
                                                        </TableCell>)
                                                    }
                                                })}
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Card className={classes.cardWidth}>
                        <CardContent>
                            <div id="NowMoney">
                                <NowMoneyGraph data={nowMoneyData} />
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    )
}

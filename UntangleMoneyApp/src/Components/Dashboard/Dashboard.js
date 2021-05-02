import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Portfolio from '../Portfolio/Portfolio';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardContent, CircularProgress, Grid, Input, InputAdornment, MenuItem, Select} from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import HomeIcon from '@material-ui/icons/Home';
import InfoIcon from '@material-ui/icons/Info';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import firebase from '../Firebase/firebase.js';
import NowMoneyGraph from '../NowMoneyGraph/NowMoneyGraph.js';
import RetirementSaving from '../Calculations/RetirementSaving.js'
import FlexCalc from '../Calculations/FlexCalc.js'


const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      backgroundColor: '#F5F5F5',
      height: '1000px'
    },
    welcomeStatement: {
        marginTop: '10px'
    },
    cardWidth: {
        width: '100%',
        minHeight: '100px'
    },
    addButtonCell : {
        borderBottom: "none"
    },
    cardTitle: {
        marginTop: '10px',
        fontSize: '14px',
        color: 'grey'
    },
    portfolio: {
        width: '100%',
        minHeight: '450px'
    },
    buttonMargins: {
        right: '0'
    },
    title: {
        flexGrow: 1
    },
    loading: {
        position: "fixed",
        top: "50%",
        left: "50%",
    }
  }));


export default function Dashboard() {

    const classes = useStyles()
    const history = useHistory();
    const curUser = firebase.auth().currentUser;
    const database = firebase.database()

    firebase.auth().onAuthStateChanged(function(user) {
        if (user != null) {
          setUserLoading(false)
        }
      })

    //User Info
    const [incomeObj, setIncomeObj] = useState(0)
    const [incomePer, setIncomePer] = useState('/year')
    const [committedMoneyObj, setCommittedMoneyObj] = useState(0)
    const [committedMoneyPer, setCommittedMoneyPer] = useState('/year')
    const [debtList, setDebtList] = useState([])
    const [lifeHappen, setLifeHappens] = useState(0)
    const [savingsGoal, setSavingsGoal] = useState(0)
    const [retirementSavings, setRetirementSavings] = useState(0)
    const [age, setAge] = useState(0)

    //Loading
    const [loading, setLoading] = useState(false)
    const [userLoading, setUserLoading] = useState(true)

    //Add New Line of Debt
    const [newDebtName, setNewDebtName] = useState(undefined)
    const [newDebtBalanceOutstanding,
        setNewDebtBalanceOutstanding] = useState('')
    const [newDebtInterestRate, setNewDebtInterestRate] = useState('')
    const [newDebtMinDebtPayment, setNewDebtMinDebtPayment] = useState('')
    const [newDebtMinDebtPer, setNewDebtMinDebtPer] = useState('/year')
    const [toggledNewDebtButton, setToggleNewDebtButton] = useState(false)

    //Edit Income, Retirement Savings, Life Happens Funds
    const [editIncome, setEditIncome] = useState(false)
    const [editRetirementSavings, setEditRetirementSavings] = useState(false)
    const [editLifeHappens, setEditLifeHappens] = useState(false)
    const [editSavingsGoal, setEditSavingsGoal] = useState(false)
    const [editCommittedMoney, setEditCommittedMoney] = useState(false)

    //New Income, Retirement Savings, Life Happens Funds
    const [newIncome, setNewIncome] = useState('')
    const [newIncomePer, setNewIncomePer] = useState('/year')
    const [newLifeHappens, setNewLifeHappens] = useState('')
    const [newSavingsGoal, setNewSavingsGoal] = useState('')
    const [newCommittedMoney, setNewCommittedMoney] = useState('')
    const [newCommittedMoneyPer, setNewCommittedMoneyPer] = useState('/year')


    const nowMoneyData = [
    {"Use": "Budget", "Type": "Flex Money", "Amount": getFlexCalculations()[1]},
    {"Use": "Budget", "Type": "Savings Goal", "Amount": parseFloat(savingsGoal)},
    {"Use": "Budget", "Type": "Additional Debt Payments", "Amount": 0},
    {"Use": "Budget", "Type": "Recurring Costs", "Amount": parseFloat(committedMoneyObj)},
    {"Use": "Budget", "Type": "Minimum Debt Payments", "Amount": getFlexCalculations()[0]},
    {"Use": "Budget", "Type": "Retirement Contributions", "Amount": getRetirementCalculations()[1]}];

    //useEffect initially pulls all the user data from Firebase and sets all the values locally, while also
    //taking those values and running all the initial calculations for Flex Money, Retirement Savings Target and Contributions
    useEffect(() => {
        if (curUser === null || userLoading) {
            return
        }

        const listRef = database.ref('/users/' + curUser.uid + '/baselineInfo')

        listRef.once('value', snap => {
            setAge(snap.val().age)
            setIncomeObj(snap.val().incomeObj * (snap.val().incomePer === "/year" ? 1 : 12))
            setCommittedMoneyObj(snap.val().committedMoneyObj * (snap.val().committedMoneyPer === "/year" ? 1 : 12))
            setLifeHappens(snap.val().lifeHappensSavings)
            setSavingsGoal(snap.val().savingsGoal === undefined ? 0 : snap.val().savingsGoal)
            setDebtList(snap.val().debt === undefined ? [] : snap.val().debt)
            setIncomePer(snap.val().incomePer)
            setCommittedMoneyPer(snap.val().committedMoneyPer)
        }).then(function() {
            setLoading(true)
        })
    }, [userLoading])

    function getRetirementCalculations(income=incomeObj, committedMoney=committedMoneyObj) {
        return RetirementSaving(
            age, 65, 95, 0.02, 0.045, 0.03, committedMoney, 1,
            income * 0.22, 1286.34, 0.22, 0
        )
    }

    function getFlexCalculations(income=incomeObj, committedMoney=committedMoneyObj, debt=debtList) {
        return FlexCalc(
            income, debt, parseFloat(lifeHappen), committedMoney,
            parseFloat(savingsGoal), getRetirementCalculations(income, committedMoney)[1]
        )
    }

    function handleNewDebtSubmit() {
        setToggleNewDebtButton(!toggledNewDebtButton)
        for (let i = 0; i < debtList.length; i++) {
            if (debtList[i].debtName === newDebtName) {
                alert("Must choose unique name for each line of debt")
                return
            }
        }

        const debt = {balanceOutstanding: newDebtBalanceOutstanding,
                    debtName: newDebtName, interestRate: newDebtInterestRate,
                    minimumDebtPaymentObj: newDebtMinDebtPayment * (newDebtMinDebtPer === "/year" ? 1 : 12),
                    minimumDebtPaymentPer: newDebtMinDebtPer}

        var debtListClone = debtList;
        debtListClone.push(debt);
        setDebtList(debtListClone);

        if ((!validMoneyInput(newDebtBalanceOutstanding)
        || newDebtBalanceOutstanding === ''
        || newDebtName === ''
        || !validInterestInput(newDebtInterestRate)
        || newDebtInterestRate === ''
        || !validMoneyInput(newDebtMinDebtPayment)
        || newDebtMinDebtPayment === '')) {
            alert("Enter valid debt line inputs!")
            handleDeleteDebt(debt)
            return
        } else if (getFlexCalculations(incomeObj, committedMoneyObj, debtListClone)[1] < 0) {
            alert("Entering this would make Flex Money 0 which isn't allowed")
            handleDeleteDebt(debt)
            return
        }

        //Update FireBase List
        database.ref('users/' + curUser.uid + '/baselineInfo/debt').set(debtList);
    }

    function handleDeleteDebt(debt) {
        var newDebtList = debtList.filter((curDebt) => curDebt.debtName !== debt.debtName);
        setDebtList(newDebtList)

        //Update Firebase List
        database.ref('users/' + curUser.uid + '/baselineInfo/debt').set(newDebtList);
    }

    function handleNewCommittedMoney() {
        if (newCommittedMoney === '' || !validMoneyInput(newCommittedMoney)) {
            alert("Committed Money must a be a valid number")
            return
        } else {
            var tempCommittedMoney = committedMoneyObj;
            var tempCommittedMoneyPer = committedMoneyPer;
            setCommittedMoneyObj(newCommittedMoney * (newCommittedMoneyPer === "/year" ? 1 : 12))
            setCommittedMoneyPer(newCommittedMoneyPer)
            if (getFlexCalculations(incomeObj, newCommittedMoney * (newCommittedMoneyPer === "/year" ? 1 : 12), debtList)[1] < 0) {
                alert("This Committed Money would make Flex Money negative")
                setCommittedMoneyObj(tempCommittedMoney);
                setCommittedMoneyPer(tempCommittedMoneyPer);
                return
            }

            database.ref('users/' + curUser.uid + '/baselineInfo/committedMoneyObj').set(newCommittedMoney)
            database.ref('users/' + curUser.uid + '/baselineInfo/committedMoneyPer').set(newCommittedMoneyPer)
            setEditCommittedMoney(!editCommittedMoney)
        }
    }

    function handleNewIncome() {
        setEditIncome(!editIncome)
        if (newIncome === '' || !validMoneyInput(newIncome)) {
            alert("Income must a be a valid number")
            return
        } else {
            var tempIncome = incomeObj;
            var tempIncomePer = incomePer;
            setIncomeObj(newIncome * (newIncomePer === "/year" ? 1 : 12));
            setIncomePer(newIncomePer)
            if (getFlexCalculations(newIncome * (newIncomePer === "/year" ? 1 : 12), committedMoneyObj, debtList)[1] < 0) {
                alert("This income would make Flex Money negative")
                setIncomeObj(tempIncome);
                setIncomePer(tempIncomePer);
                return
            }

            database.ref('users/' + curUser.uid + '/baselineInfo/incomeObj').set(newIncome)
            database.ref('users/' + curUser.uid + '/baselineInfo/incomePer').set(newIncomePer)
        }
    }


    function handleNewLifeHappens() {
        if (newLifeHappens === '' || !validMoneyInput(newLifeHappens)) {
            alert("New Life Happens Funds must be a valid number")
            setEditLifeHappens(!editLifeHappens)
            return
        } else {
            setLifeHappens(newLifeHappens)
        }
        setEditLifeHappens(!editLifeHappens)

        //Update Firebase List
        database.ref('users/' + curUser.uid +
        '/baselineInfo/lifeHappensSavings').set(newLifeHappens)
    }

    function handleNewSavingsGoal() {
        if (newSavingsGoal === '' || !validMoneyInput(newSavingsGoal)) {
            alert("Invalid Savings Goal value");
        } else if (parseFloat(newSavingsGoal) > getFlexCalculations()[1] + parseFloat(savingsGoal)) {
            alert("Savings Goal cannot be greater than Flex Money");
        } else {
            setSavingsGoal(newSavingsGoal)
            //Update Firebase List
            database.ref('users/' + curUser.uid +
            '/baselineInfo/savingsGoal').set(newSavingsGoal)
        }
        setEditSavingsGoal(!editSavingsGoal)
    }

    function handleLogout() {
        if (curUser) {
            firebase.auth().signOut()
            history.push('/')
        } else {
            console.log("Error no user")
        }
    }

    function validMoneyInput(money) {
        const validRegex = new RegExp('^(\\d+)$|^(\\d+\\.\\d{2})$')
        return (money === '' ? true : money.match(validRegex));
    }

    function validInterestInput(interestRate) {
      const validRegex = new RegExp('^(\\d+)$|^(\\d+\\.\\d{1,2})$')
      return (interestRate === '' ? true : interestRate.match(validRegex));
    }

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Profile Page
                    </Typography>
                    <Button color="inherit" startIcon={<HomeIcon />}>Home</Button>
                    <Button color="inherit" startIcon={<InfoIcon />}>About</Button>
                    <Button color="inherit" startIcon={<HourglassEmptyIcon />} href='#portfolio'>Progress</Button>
                    <Button color="inherit" startIcon={<ExitToAppIcon />} onClick={() => handleLogout()}>Logout</Button>
                </Toolbar>
            </AppBar>
            {loading ?
            (<Grid container spacing={2} direction="row">
                <Grid item xs={12} className={classes.welcomeStatement}>
                    <Typography align="center">
                        Welcome {curUser.displayName}!
                    </Typography>
                </Grid>
                <Grid container item xs={12} lg={3}>
                    <Card variant="outlined" className={classes.cardWidth}>
                        <CardContent>
                            <Typography className={classes.cardTitle}>Income: </Typography>
                            {editIncome
                            ?
                            (<div>
                                <Input
                                variant="outlined"
                                required
                                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                endAdornment={<Select
                                               value={newIncomePer}
                                               onChange={e => (setNewIncomePer(e.target.value))}
                                               >
                                                   <MenuItem value={'/year'}>/year</MenuItem>
                                                   <MenuItem value={'/month'}>/month</MenuItem>
                                               </Select>}
                                value={newIncome}
                                onChange={e => setNewIncome(e.target.value)}
                                error={!validMoneyInput(newIncome)}
                                />
                                <Typography> </Typography>
                                <Button onClick={() => handleNewIncome()}>Submit</Button>
                            </div>)
                            : (<div>
                                <Typography>${incomeObj / (incomePer === "/year" ? 1 : 12) + incomePer}</Typography>
                                <Button className={classes.buttonMargins} onClick={() => setEditIncome(!editIncome)}>Edit</Button>
                            </div>)
                            }
                        </CardContent>
                    </Card>
                </Grid>
                <Grid container item xs={12} lg={3}>
                    <Card variant="outlined" className={classes.cardWidth}>
                        <CardContent>
                            <Typography className={classes.cardTitle}>Recurring Costs: </Typography>
                            {editCommittedMoney
                            ?
                            (<div>
                                <Input
                                variant="outlined"
                                required
                                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                endAdornment={<Select
                                                value={newCommittedMoneyPer}
                                                onChange={e => setNewCommittedMoneyPer(e.target.value)}
                                                >
                                                    <MenuItem value={'/year'}>/year</MenuItem>
                                                    <MenuItem value={'/month'}>/month</MenuItem>
                                                </Select>}
                                value={newCommittedMoney}
                                onChange={e => setNewCommittedMoney(e.target.value)}
                                error={!validMoneyInput(newCommittedMoney)}
                                />
                                <Typography> </Typography>
                                <Button onClick={() => handleNewCommittedMoney()}>Submit</Button>
                            </div>)
                            : (<div>
                                <Typography>${committedMoneyObj / (committedMoneyPer === "/year" ? 1 : 12) + committedMoneyPer}</Typography>
                                <Button className={classes.buttonMargins} onClick={() => setEditCommittedMoney(!editCommittedMoney)}>Edit</Button>
                            </div>)
                            }
                        </CardContent>
                    </Card>
                </Grid>
                <Grid container item xs={12} lg={3}>
                    <Card variant="outlined" className={classes.cardWidth}>
                        <CardContent>
                            <Typography className={classes.cardTitle}>Life Happens Savings:</Typography>
                            {editLifeHappens
                            ?
                            (<div>
                                <Input
                                variant="outlined"
                                required
                                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                value={newLifeHappens}
                                onChange={e => setNewLifeHappens(e.target.value)}
                                error={!validMoneyInput(newLifeHappens)}
                                />
                                <Typography> </Typography>
                                <Button onClick={() => handleNewLifeHappens()}>Submit</Button>
                            </div>)
                            :
                            (<div>
                                <Typography>${lifeHappen}</Typography>
                                <Button className={classes.buttonMargins} onClick={() => setEditLifeHappens(!editLifeHappens)}>Edit</Button>
                            </div>)
                            }
                        </CardContent>
                    </Card>
                </Grid>
                <Grid container item xs={12} lg={3}>
                    <Card variant="outlined" className={classes.cardWidth}>
                        <CardContent>
                            <Typography className={classes.cardTitle}>Savings Goal:</Typography>
                            {editSavingsGoal
                            ?
                            (<div>
                                <Input
                                variant="outlined"
                                required
                                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                value={newSavingsGoal}
                                onChange={e => setNewSavingsGoal(e.target.value)}
                                error={!validMoneyInput(newSavingsGoal)
                                    || parseFloat(savingsGoal) > getFlexCalculations()[1] + parseFloat(savingsGoal)}
                                />
                                <Typography> </Typography>
                                <Button onClick={() => handleNewSavingsGoal()}>Submit</Button>
                            </div>)
                            :
                            (<div>
                                <Typography>${savingsGoal + "/year"}</Typography>
                                <Button className={classes.buttonMargins}
                                        onClick={() => setEditSavingsGoal(!editSavingsGoal)}>Edit</Button>
                            </div>)
                            }
                        </CardContent>
                    </Card>
                </Grid>
                <Grid container item xs={12} lg={7}>
                    <Grid item xs={12}>
                        <Card variant="outlined" className={classes.cardTitle}>
                            <CardContent>
                                <Typography align="left">Lines of Debt: </Typography>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Debt Type:</TableCell>
                                            <TableCell>Balance Outstanding</TableCell>
                                            <TableCell>Minimum Debt Payment</TableCell>
                                            <TableCell>Interest Rate</TableCell>
                                            <TableCell className={classes.addButtonCell}><Button onClick={() => setToggleNewDebtButton(!toggledNewDebtButton)}>Add</Button></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {toggledNewDebtButton
                                        ?
                                        (<TableRow>
                                            <TableCell>
                                                <Input
                                                variant="outlined"
                                                required
                                                value={newDebtName}
                                                onChange={e => setNewDebtName(e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                variant="outlined"
                                                required
                                                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                                value={newDebtBalanceOutstanding}
                                                onChange={e => setNewDebtBalanceOutstanding(e.target.value)}
                                                error={!validMoneyInput(newDebtBalanceOutstanding)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                variant="outlined"
                                                required
                                                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                                endAdornment={<Select
                                                    value={newDebtMinDebtPer}
                                                    onChange={e => setNewDebtMinDebtPer(e.target.value)}
                                                >
                                                    <MenuItem value={'/year'}>/year</MenuItem>
                                                    <MenuItem value={'/month'}>/month</MenuItem>
                                                </Select>}
                                                value={newDebtMinDebtPayment}
                                                onChange={e => setNewDebtMinDebtPayment(e.target.value)}
                                                error={!validMoneyInput(newDebtMinDebtPayment)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                variant="outlined"
                                                required
                                                endAdornment={<InputAdornment position="end">%</InputAdornment>}
                                                value={newDebtInterestRate}
                                                onChange={e=>setNewDebtInterestRate(e.target.value)}
                                                error={!validInterestInput(newDebtInterestRate)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button onClick={() => handleNewDebtSubmit()}>Submit</Button>
                                            </TableCell>
                                        </TableRow>)
                                        :
                                        (<div></div>)
                                        }
                                        {debtList.map(debt =>
                                        (<TableRow>
                                            <TableCell>{debt.debtName}</TableCell>
                                            <TableCell>${debt.balanceOutstanding}</TableCell>
                                            <TableCell>${debt.minimumDebtPaymentObj /
                                                (debt.minimumDebtPaymentPer === "/year" ? 1 : 12) +
                                                debt.minimumDebtPaymentPer}</TableCell>
                                            <TableCell>{debt.interestRate}%</TableCell>
                                            <TableCell><Button onClick={() => handleDeleteDebt(debt)}>Delete</Button></TableCell>
                                        </TableRow>))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                <Grid container item xs={12} lg={5}>
                    <Card variant="outlined" className={classes.cardWidth}>
                        <CardContent>
                            <div id="NowMoney">
                                <NowMoneyGraph data={nowMoneyData} />
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} id="portfolio">
                    <Portfolio age={age} income={incomeObj} committedMoneyObj={committedMoneyObj}
                    debt={debtList} lifeHappens={lifeHappen} savingsGoal={savingsGoal}
                    retirementContribution={getRetirementCalculations()[1]}/>
                </Grid>
            </Grid>)
            :
            (<div><CircularProgress className={classes.loading}/></div>)
            }
        </div>
    )
}

function DebtCalc(debt, debtMethod, desirePay){
    // debtMethod = [snowball, avalanche]
    // assume period is in terms of months, if want year, convert into  month first.
    // assume desirePay is enough to cover for every debt for each month.
    // keep track of unfinished debt
    var final = {}

    var debts = JSON.parse(JSON.stringify(debt));
    Object.assign(debts, debt);
    // Check if theres more than one line of debt and left over desire payment
    // Sort the debt lines based on debtMethod
    if (debtMethod.localeCompare("snowball") === 0) {
        debts.sort((a, b) => {
            return parseFloat(a["balanceOutstanding"]) - parseFloat(b["balanceOutstanding"])
        })
    } else if (debtMethod.localeCompare("avalanche") === 0) {
        debts.sort((a, b) => {
            return (parseFloat(b["interestRate"]) / 100) - (parseFloat(a["interestRate"]) / 100)
        })
    } else {
        console.log("Error: Invalid debt method type")
    }

    var year_counter = 1;
    
    while (debts.length > 0){
        var monthlyPayment = desirePay;
        //calculate min debt payment for each debt line first
        for (var i = 0; i < debts.length; i++){
            var d = debts[i];
            if (!final[d["debtName"]]){
                final[d["debtName"]] = {"totalInterestPaid": 0,
                    "date": 0, "balance": parseFloat(d["balanceOutstanding"]), "minApplied": 0,
                    "additional": 0,
                    "periodInfo": {"0": {"balance": parseFloat(d["balanceOutstanding"]), "minPayment": 0, "extraPayment": 0}}};
            }
            var interestPaid;
            //1 if month, 4 if week, 1/12 if year for minPaymentPeriod
            // note here final[d["debtName"]]["balance"] is float
            //interest rate need to divide by 100, since the input is in %
            interestPaid = final[d["debtName"]]["balance"] * (parseFloat(d["interestRate"]) / 100);

            // date initally 1 month
            var minimumPaymentApplied;

            var minPayment = parseFloat(d["minimumDebtPaymentObj"]);

            //if balance = 0, subtract only the prior balance + interest
            //final[d["debtName"]]["balance"] is in float already
            minimumPaymentApplied = Math.min(final[d["debtName"]]["balance"] + interestPaid, minPayment);
            monthlyPayment -= minimumPaymentApplied;

            //update final
            final[d["debtName"]]["balance"] -= minimumPaymentApplied;
            final[d["debtName"]]["totalInterestPaid"] += interestPaid;
            final[d["debtName"]]["date"]++;
            final[d["debtName"]]["minApplied"] += minimumPaymentApplied;
            final[d["debtName"]]["periodInfo"][final[d["debtName"]]["date"]] =
                {"balance": final[d["debtName"]]["balance"], "minPayment": minimumPaymentApplied, "extraPayment": 0}
        }

        removeEmptyDebts(final, debts);

        //calculate extra payments
        var debt_index = 0
        while (monthlyPayment > 0 && debt_index < debts.length) {
            var currentDate = final[debts[debt_index]["debtName"]]["date"]
            final[debts[debt_index]["debtName"]]["periodInfo"][currentDate]["extraPayment"] += Math.min(monthlyPayment,
                final[debts[debt_index]["debtName"]]["balance"])
            final[debts[debt_index]["debtName"]]["balance"] = Math.max(0,
                final[debts[debt_index]["debtName"]]["balance"] - monthlyPayment)
            monthlyPayment -= Math.max(0, monthlyPayment - final[debts[debt_index]["debtName"]]["balance"]);
            debt_index += 1
        }

        removeEmptyDebts(final, debts);
        year_counter++;
    }
    return final;
}

//remove debt's balance that is zero
function removeEmptyDebts(final, debts) {
    var toBeRemove = []
    for (var j = 0; j < debts.length; j++){
        if (final[debts[j]["debtName"]]["balance"] === 0){
            toBeRemove.push(j);
        }
    }

    for (j = 0; j < toBeRemove.length; j ++){
        debts.splice(toBeRemove[j], 1);
    }
}
export default DebtCalc;

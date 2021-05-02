function FlexCalc(income, debt, lifeHappen, recurringCost, savingsGoal, retirementSaving){

    var sumMinPayment = 0;
    for (var i = 0; i < debt.length; i++){
        sumMinPayment += parseFloat(debt[i]["minimumDebtPaymentObj"]);
    }

    var flex = income - sumMinPayment - recurringCost - retirementSaving - savingsGoal;
    return [sumMinPayment, parseFloat(flex.toFixed(2))];

}

export default FlexCalc;

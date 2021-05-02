function RetirementSaving(
    currentAge,
    retirementAge,
    deathAge,
    inflationRate,
    preRetirementInterestRate,
    postRetirementInterestRate,
    recurringCosts,
    percentRecurringCost,
    flexMoney,
    governmentBenefits,
    retirementTaxRate,
    currentRetirementSavings
) {
    const target = targetRetirementSavings(
        currentAge,
        retirementAge,
        deathAge,
        inflationRate,
        preRetirementInterestRate,
        postRetirementInterestRate,
        recurringCosts,
        percentRecurringCost,
        flexMoney,
        governmentBenefits,
        retirementTaxRate
    );
    const contribution = regularSavingContri(
        target, currentRetirementSavings, retirementAge,
        currentAge, preRetirementInterestRate
    );
    return [target, contribution];
}



function targetRetirementSavings(
    currentAge,
    retirementAge,
    deathAge,
    inflationRate,
    preRetirementInterestRate,
    postRetirementInterestRate,
    recurringCosts,
    percentRecurringCost,
    flexMoney,
    governmentBenefits, // Estimate
    retirementTaxRate // Estimate

) {
    var annualMoneyRequirement = []

    // There are death_age - retirement_age + 1 years in retirement
    for (var i = 0; i < deathAge - retirementAge + 1; i++) {
        var period = retirementAge + i - currentAge;
        var inflationFactor = Math.pow(1 + inflationRate, period);

        // The future value of living costs
        var livingCosts = (recurringCosts * 12 * percentRecurringCost + flexMoney * 12) * inflationFactor;

        // Income tax amount to meet tax rate
        var incomeTax = (livingCosts * retirementTaxRate) / (1 - retirementTaxRate);

        var governmentBenefitsYear = governmentBenefits * inflationFactor * 12;

        annualMoneyRequirement.push(Math.max(livingCosts + incomeTax - governmentBenefitsYear, 0))
    }

    // The amount of money needed at the start of retirement to meet target.
    var retirementBalance = 0

    for (i = annualMoneyRequirement.length - 1; i >= 0; i--) {
        retirementBalance = annualMoneyRequirement[i] + retirementBalance/(1 + postRetirementInterestRate);
    }

    return Math.round(retirementBalance * 100 + Number.EPSILON) / 100;

}

function regularSavingContri(retireSavingsTarget, currentRetirementSavings, retireAge, currentAge, rate){
    const FutureValueSavings = currentRetirementSavings * Math.pow((1 + rate), ((retireAge - currentAge)));
    const annualContributions = (retireSavingsTarget - FutureValueSavings) * rate /
    (Math.pow((1 + rate), (retireAge - currentAge) + 1) - (1 + rate));
    return Math.round(annualContributions / 12 * 100 + Number.EPSILON) / 100;
}

export default RetirementSaving;

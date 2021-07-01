class YearlyTaxCalculator {

    socialInsurancePercentStepsByWorkerType = {

        // 2.87% of 60% of the average wage, and 12.83% of the rest until the maximum insured wage
        selfEmployed: [0.0287, 0.1283],

        // 0.4% of 60% of the average wage, and 7% of the rest until the maximum insured wage
        hired: [0.004, 0.07],
    };

    // 3.1% of 60% of the average wage, and 5% of the rest until the maximum insured wage
    healthInsurancePercentSteps = [0.031, 0.05];

    // 10%, 14%, 20%, 31%, 35%, 47%, 50%
    incomePercentSteps = [0.1, 0.14, 0.2, 0.31, 0.35, 0.47, 0.5];

    pensionPercentStepsByWorkerType = {

        // 4.45% from 50% of the average wage, and 12.55% for the rest to the maximum of the average wage
        selfEmployed: [0.0445, 0.1255],

        // 6% from 100% of the average wage
        hired: [0.06],
    };

    constructor(totalProfit, year, allowancePoints=0, timePeriod='year', workerType='selfEmployed') {
        var baseData = baseDataByYears[year];

        this.totalProfit     = totalProfit;
        this.year            = year;
        this.allowancePoints = allowancePoints;
        this.timePeriod      = timePeriod;
        this.workerType      = workerType;

        this.monthlyAverageWage        = baseData.monthlyAverageWage;
        this.monthlyMaxInsuredWage     = baseData.monthlyMaxInsuredWage;
        this.monthlyMinimumWage        = baseData.monthlyMinimumWage;
        this.incomeTaxMaxAmountSteps   = baseData.incomeTaxMaxAmountSteps;
        this.yearlyAllowancePointWorth = baseData.yearlyAllowancePointWorth;

        this.set60PercentOfMonthlyAvgWage();
        this.setHalfOfMonthlyAvgWage();
        // this.setYearlyAvgWage();
        // this.setHalfOfYearlyAvgWage();

        this.buildSocialInsuranceSteps();
        this.buildHealthInsuranceSteps();
        this.buildIncomeSteps();
        this.buildPensionSteps();
    }

    set60PercentOfMonthlyAvgWage(){
        this.sixtyPercentMonthlyAvgWage = Math.round(this.monthlyAverageWage * 0.6);
    }

    setHalfOfMonthlyAvgWage(){
        this.halfMonthlyAvgWage = this.monthlyAverageWage / 2;
    }

    // setYearlyAvgWage(){
    //     this.yearlyAvgWage = this.monthlyAverageWage * 12;
    // }

    // setHalfOfYearlyAvgWage(){
    //     this.halfYearlyAvgWage = this.yearlyAvgWage / 2;
    // }

    buildSocialInsuranceSteps(){
        var socialInsurancePercentSteps = this.socialInsurancePercentStepsByWorkerType[this.workerType];

        this.socialInsuranceSteps = [];

        for (let i = 0; i < socialInsurancePercentSteps.length; i++) {

            let currentStep = {
                percentage: socialInsurancePercentSteps[i],
                maxSum: (i > 0) ? this.monthlyMaxInsuredWage : this.sixtyPercentMonthlyAvgWage
            };

            if(i > 0){
                currentStep.minSum = this.socialInsuranceSteps[i-1].maxSum;
            }

            this.socialInsuranceSteps.push(currentStep);
        }


        /*
        the steps of the social insurance taxation
        every step indicates a salary cap, minimum and it's own percentage
        the default minimum is 0, the default cap is infinite

        here's an example of the result
        [
            {               percentage: 0.004, maxSum: 5804},
            {minSum: 5804,  percentage: 0.07,  maxSum: 43240},
        ]
        */
    }

    buildHealthInsuranceSteps(){

        this.healthInsuranceSteps = [];

        for (let i = 0; i < this.healthInsurancePercentSteps.length; i++) {

            let currentStep = {
                percentage: this.healthInsurancePercentSteps[i],
                maxSum: (i > 0) ? this.monthlyMaxInsuredWage : this.sixtyPercentMonthlyAvgWage
            };

            if(i > 0){
                currentStep.minSum = this.healthInsuranceSteps[i-1].maxSum;
            }

            this.healthInsuranceSteps.push(currentStep);
        }
    }

    buildIncomeSteps(){
        this.incomeSteps = [];

        for (let i = 0; i < this.incomePercentSteps.length; i++) {

            let currentStep = {
                percentage: this.incomePercentSteps[i],
            };

            if( this.incomeTaxMaxAmountSteps[i] ){
                currentStep.maxSum = this.incomeTaxMaxAmountSteps[i];
            }

            if(i > 0){
                currentStep.minSum = this.incomeSteps[i-1].maxSum;
            }

            this.incomeSteps.push(currentStep);
        }
    }

    buildPensionSteps(){

        var pensionPercentSteps = this.pensionPercentStepsByWorkerType[this.workerType];

        this.pensionSteps = [];

        for (let i = 0; i < pensionPercentSteps.length; i++) {

            let currentStep = {
                percentage: pensionPercentSteps[i],
                maxSum: (i > 0 || pensionPercentSteps.length == 1) ? this.monthlyAverageWage : this.halfMonthlyAvgWage
            };

            if(i > 0){
                currentStep.minSum = this.pensionSteps[i-1].maxSum;
            }

            this.pensionSteps.push(currentStep);
        }
    }

    // generic function that calc required payment by using the payment steps structre
    // every step indicates a salary cap, minimum and it's own percentage
    // the default minimum is 0, the default cap is infinite
    getRequiredPaymentBySteps(sum, paymentSteps){
        var sumForStep, minSumForStep, maxSumForStep,
            requiredPayment = 0;

        // loop through the payment steps
        for (var i = 0; i < paymentSteps.length; i++) {
            minSumForStep = paymentSteps[i].minSum || 0;
            maxSumForStep = Math.min(sum, (paymentSteps[i].maxSum || sum));
            sumForStep    = maxSumForStep - minSumForStep;

            // how much percentage from the sum in this step we are required to pay
            requiredPayment += sumForStep * paymentSteps[i].percentage;

            if (sum == maxSumForStep) break;
        }

        return requiredPayment;
    }

    // social insurance tax is defined in monthly sums
    // for a yearly calculation, we divide his profit by 12 and at the end multiply it back by 12
    getSocialInsuranceTax(){

        var isYearlySum = (this.timePeriod == 'year');

        // divide by 12 months and calc as one month's sum
        var sum = (isYearlySum) ? this.totalProfit/12 : this.totalProfit;

        var socialInsuranceTax = this.getRequiredPaymentBySteps(sum, this.socialInsuranceSteps);

        // multiply by 12 months to return the yearly sum
        socialInsuranceTax = (isYearlySum) ? socialInsuranceTax*12 : socialInsuranceTax;

        return parseFloat(socialInsuranceTax.toFixed(2));
    }

    // social insurance tax is defined in monthly sums
    // for a yearly calculation, we divide his profit by 12 and at the end multiply it back by 12
    getHealthInsuranceTax(){

        var isYearlySum = (this.timePeriod == 'year');

        // divide by 12 months and calc as one month's sum
        var sum = (isYearlySum) ? this.totalProfit/12 : this.totalProfit;

        var healthInsuranceTax = this.getRequiredPaymentBySteps(sum, this.healthInsuranceSteps);

        // multiply by 12 months to return the yearly sum
        healthInsuranceTax = (isYearlySum) ? healthInsuranceTax*12 : healthInsuranceTax;

        return parseFloat(healthInsuranceTax.toFixed(2));
    }


    // income tax is defined in yearly sums
    // for a monthly calculation, we multiply his profit by 12 and at the end divide it back by 12
    getIncomeTax(){

        var isYearlySum = (this.timePeriod == 'year');

        // multiply by 12 months and calc as yearly sum
        var sum = (!isYearlySum) ? this.totalProfit*12 : this.totalProfit;

        var incomeTax = this.getRequiredPaymentBySteps(sum, this.incomeSteps);

        // reduce tax allowance from the final tax sum
        var allowance = this.allowancePoints * this.yearlyAllowancePointWorth;
        incomeTax = (incomeTax - allowance > 0) ? Math.round(incomeTax - allowance) : 0;

        // divide by 12 months to return the monthly sum
        incomeTax = (!isYearlySum) ? incomeTax/12 : incomeTax;

        return parseFloat(incomeTax.toFixed(2));
    }


    // required pension is defined in monthly sums
    // for a yearly calculation, we divide his profit by 12 and at the end multiply it back by 12
    getRequiredPension(){

        var isYearlySum = (this.timePeriod == 'year');

        // divide by 12 months and calc as one month's sum
        var sum = (isYearlySum) ? this.totalProfit/12 : this.totalProfit;

        var requiredPension = this.getRequiredPaymentBySteps(sum, this.pensionSteps);

        // multiply by 12 months to return the yearly sum
        requiredPension = (isYearlySum) ? requiredPension*12 : requiredPension;

        return parseFloat(requiredPension.toFixed(2));
    }

}

module.exports = YearlyTaxCalculator;
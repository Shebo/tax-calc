var getRequiredPaymentBySteps = function(sum, paymentSteps){
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
};

var SocialInsuranceTax = (function() {
    return {
        // the steps of the social insurance taxation
        // every step indicates a salary cap, minimum and it's own percentage
        // the default minimum is 0, the default cap is infinite
        socialInsuranceSteps: {
            2017: {
                selfEmployed: [
                    {               percentage: 0.0287, maxSum: 5804},   // 0       >< 5,804   -- 2.87%
                    {minSum: 5804,  percentage: 0.1283, maxSum: 43240},  // 5,804   >< 43,240  -- 12.83%
                ],
                hired: [
                    {               percentage: 0.004, maxSum: 5804},   // 0       >< 5,804   -- 0.4%
                    {minSum: 5804,  percentage: 0.07,  maxSum: 43240},  // 5,804   >< 43,240  -- 7%
                ],
            },

            2018: {
                selfEmployed: [
                    {               percentage: 0.0287, maxSum: 5944},   // 0       >< 5,944   -- 2.87%
                    {minSum: 5944,  percentage: 0.1283, maxSum: 43370},  // 5,944   >< 43,370  -- 12.83%
                ],
                hired: [
                    {               percentage: 0.004, maxSum: 5944},   // 0       >< 5,944   -- 0.4%
                    {minSum: 5944,  percentage: 0.07,  maxSum: 43370},  // 5,944   >< 43,370  -- 7%
                ],
            },

            2019: {
                selfEmployed: [
                    {               percentage: 0.0287, maxSum: 6164},   // 0       >< 6,164   -- 2.87%
                    {minSum: 6164,  percentage: 0.1283, maxSum: 43890},  // 6,164   >< 43,890  -- 12.83%
                ],
                hired: [
                    {               percentage: 0.004, maxSum: 6164},   // 0       >< 6,164   -- 0.4%
                    {minSum: 6164,  percentage: 0.07,  maxSum: 43890},  // 6,164   >< 43,890  -- 7%
                ],
            },
            2020: {
                selfEmployed: [
                    {               percentage: 0.0287, maxSum: 6331},   // 0       >< 6,331   -- 2.87%
                    {minSum: 6331,  percentage: 0.1283, maxSum: 44020},  // 6,331   >< 44,020  -- 12.83%
                ],
                hired: [
                    {               percentage: 0.004, maxSum: 6164},   // 0       >< 6,164   -- 0.4%
                    {minSum: 6164,  percentage: 0.07,  maxSum: 44020},  // 6,164   >< 44,020  -- 7%
                ],
            },
            2021: {
                selfEmployed: [
                    {               percentage: 0.0287, maxSum: 6331},   // 0       >< 6,331   -- 2.87%
                    {minSum: 6331,  percentage: 0.1283, maxSum: 44020},  // 6,331   >< 44,020  -- 12.83%
                ],
                hired: [
                    {               percentage: 0.004, maxSum: 6331},   // 0       >< 6,164   -- 0.4%
                    {minSum: 6331,  percentage: 0.07,  maxSum: 44020},  // 6,164   >< 44,020  -- 7%
                ],
            },
        },

        getSocialInsuranceTax: function(sum, workerType, isYearlySum, year){

            year        = year || (new Date()).getFullYear();
            workerType  = workerType || 'selfEmployed';
            isYearlySum = (typeof isYearlySum == 'boolean') ? isYearlySum : false;

            // divide by 12 months and calc as one month's sum
            if(isYearlySum) sum = sum/12;


            var socialInsuranceSteps = this.socialInsuranceSteps[year][workerType];
            var socialInsuranceTax = getRequiredPaymentBySteps(sum, socialInsuranceSteps);

            // multiply by 12 months to return the yearly sum
            if(isYearlySum){
                socialInsuranceTax = socialInsuranceTax*12;
            }

            return parseFloat(socialInsuranceTax.toFixed(2));
        }
    };
})();

var HealthInsuranceTax = (function() {
    return {
        // the steps of the health insurance taxation
        // every step indicates a salary cap, minimum and it's own percentage
        // the default minimum is 0, the default cap is infinite
        healthInsuranceSteps: {
            2017: [
                {              percentage: 0.031, maxSum: 5804},  // 0       >< 5,804   -- 3.1%
                {minSum: 5804, percentage: 0.05,  maxSum: 43240}, // 5,804   >< 43,240  -- 5%
            ],
            2018: [
                {              percentage: 0.031, maxSum: 5944},  // 0       >< 5,944   -- 3.1%
                {minSum: 5944, percentage: 0.05,  maxSum: 43370}, // 5,944   >< 43,370  -- 5%
            ],
            2019: [
                {              percentage: 0.031, maxSum: 6164},  // 0       >< 6,164   -- 3.1%
                {minSum: 6164, percentage: 0.05,  maxSum: 43890}, // 6,164   >< 43,890  -- 5%
            ],
            2020: [
                {              percentage: 0.031, maxSum: 6331},  // 0       >< 6,331   -- 3.1%
                {minSum: 6331, percentage: 0.05,  maxSum: 44020}, // 6,331   >< 44,020  -- 5%
            ],
            2021: [
                {              percentage: 0.031, maxSum: 6331},  // 0       >< 6,331   -- 3.1%
                {minSum: 6331, percentage: 0.05,  maxSum: 44020}, // 6,331   >< 44,020  -- 5%
            ],
        },

        getHealthInsuranceTax: function(sum, isYearlySum, year){

            year        = year || (new Date()).getFullYear();
            isYearlySum = (typeof isYearlySum == 'boolean') ? isYearlySum : false;

            // divide by 12 months and calc as one month's sum
            if(isYearlySum) sum = sum/12;


            var healthInsuranceSteps = this.healthInsuranceSteps[year];
            var healthInsuranceTax = getRequiredPaymentBySteps(sum, healthInsuranceSteps);

            // multiply by 12 months to return the yearly sum
            if(isYearlySum){
                healthInsuranceTax = healthInsuranceTax*12;
            }

            return parseFloat(healthInsuranceTax.toFixed(2));
        }
    };
})();

var IncomeTax = (function(){
    return {
        // the steps of the income taxation
        // every step indicates a salary cap, minimum and it's own percentage
        // the default minimum is 0, the default cap is infinite
        incomeSteps: {
            2021: [
                {                percentage: 0.1,  maxSum: 75480},  // 0       >< 75,480  -- 10%
                {minSum: 75480,  percentage: 0.14, maxSum: 108360}, // 75,480  >< 108,360 -- 14%
                {minSum: 108360, percentage: 0.2,  maxSum: 173880}, // 108,360 >< 173,880 -- 20%
                {minSum: 173880, percentage: 0.31, maxSum: 241680}, // 173,880 >< 241,680 -- 31%
                {minSum: 241680, percentage: 0.35, maxSum: 502920}, // 241,680 >< 502,920 -- 35%
                {minSum: 502920, percentage: 0.47, maxSum: 647640}, // 502,920 >< 647,640 -- 47%
                {minSum: 647640, percentage: 0.5                 }, // 647,640 >          -- 50%
            ],
            2020: [
                {                percentage: 0.1,  maxSum: 75960},  // 0       >< 75,960  -- 10%
                {minSum: 75960,  percentage: 0.14, maxSum: 108960}, // 75,960  >< 108,960 -- 14%
                {minSum: 108960, percentage: 0.2,  maxSum: 174960}, // 108,960 >< 174,960 -- 20%
                {minSum: 174960, percentage: 0.31, maxSum: 243120}, // 174,960 >< 243,120 -- 31%
                {minSum: 243120, percentage: 0.35, maxSum: 505920}, // 243,120 >< 505,920 -- 35%
                {minSum: 505920, percentage: 0.47, maxSum: 651600}, // 505,920 >< 651,600 -- 47%
                {minSum: 651600, percentage: 0.5                 }, // 651,600 >          -- 50%
            ],
            2019: [
                {                percentage: 0.1,  maxSum: 75720},  // 0       >< 75,720  -- 10%
                {minSum: 75720,  percentage: 0.14, maxSum: 108600}, // 75,720  >< 108,600 -- 14%
                {minSum: 108600, percentage: 0.2,  maxSum: 174360}, // 108,600 >< 174,360 -- 20%
                {minSum: 174360, percentage: 0.31, maxSum: 242400}, // 174,360 >< 242,400 -- 31%
                {minSum: 242400, percentage: 0.35, maxSum: 504360}, // 242,400 >< 504,360 -- 35%
                {minSum: 504360, percentage: 0.47, maxSum: 649560}, // 504,360 >< 649,560 -- 47%
                {minSum: 649560, percentage: 0.5                 }, // 649,560 >          -- 50%
            ],
            2018: [
                {                percentage: 0.1,  maxSum: 74880},  // 0       >< 74,880  -- 10%
                {minSum: 74880,  percentage: 0.14, maxSum: 107400}, // 74,880  >< 107,400 -- 14%
                {minSum: 107400, percentage: 0.2,  maxSum: 172320}, // 107,400 >< 172,320 -- 20%
                {minSum: 172320, percentage: 0.31, maxSum: 239520}, // 172,320 >< 239,520 -- 31%
                {minSum: 239520, percentage: 0.35, maxSum: 498360}, // 239,520 >< 498,360 -- 35%
                {minSum: 498360, percentage: 0.47, maxSum: 641880}, // 498,360 >< 641,880 -- 47%
                {minSum: 641880, percentage: 0.5                 }, // 641,880 >          -- 50%
            ],
            2017: [
                {                percentage: 0.1,  maxSum: 74640},  // 0       >< 74,640  -- 10%
                {minSum: 74640,  percentage: 0.14, maxSum: 107040}, // 74,640  >< 107,040 -- 14%
                {minSum: 107040, percentage: 0.2,  maxSum: 171840}, // 107,040 >< 171,840 -- 20%
                {minSum: 171840, percentage: 0.31, maxSum: 238800}, // 171,840 >< 238,800 -- 31%
                {minSum: 238800, percentage: 0.35, maxSum: 496920}, // 238,800 >< 496,920 -- 35%
                {minSum: 496920, percentage: 0.47, maxSum: 640000}, // 496,920 >< 640,000 -- 47%
                {minSum: 640000, percentage: 0.5                 }, // 640,000 >          -- 50%
            ],
            2016: [
                {                percentage: 0.1,  maxSum: 62640},  // 0       >< 62,640  -- 10%
                {minSum: 62640,  percentage: 0.14, maxSum: 107040}, // 62,640  >< 107,040 -- 14%
                {minSum: 107040, percentage: 0.21, maxSum: 166320}, // 107,040 >< 166,320 -- 21%
                {minSum: 166320, percentage: 0.31, maxSum: 237600}, // 166,320 >< 237,600 -- 31%
                {minSum: 237600, percentage: 0.34, maxSum: 496920}, // 237,600 >< 496,920 -- 34%
                {minSum: 496920, percentage: 0.48, maxSum: 803520}, // 496,920 >< 803,520 -- 48%
                {minSum: 803520, percentage: 0.5                 }, // 803,520 >          -- 50%
            ],
            2015: [
                {                percentage: 0.1,  maxSum: 63240},  // 0       >< 63,240  -- 10%
                {minSum: 63240,  percentage: 0.14, maxSum: 108000}, // 63,240  >< 108,000 -- 14%
                {minSum: 108000, percentage: 0.21, maxSum: 167880}, // 108,000 >< 167,880 -- 21%
                {minSum: 167880, percentage: 0.31, maxSum: 239760}, // 167,880 >< 239,760 -- 31%
                {minSum: 239760, percentage: 0.34, maxSum: 501480}, // 239,760 >< 501,480 -- 34%
                {minSum: 501480, percentage: 0.48, maxSum: 810720}, // 501,480 >< 810,720 -- 48%
                {minSum: 810720, percentage: 0.5                 }, // 810,720 >          -- 50%
            ],
            2014: [
                {                percentage: 0.1,  maxSum: 63360},  // 0       >< 63,360  -- 10%
                {minSum: 63360,  percentage: 0.14, maxSum: 108120}, // 63,360  >< 108,120 -- 14%
                {minSum: 108120, percentage: 0.21, maxSum: 168000}, // 108,120 >< 168,000 -- 21%
                {minSum: 168000, percentage: 0.31, maxSum: 240000}, // 168,000 >< 240,000 -- 31%
                {minSum: 240000, percentage: 0.34, maxSum: 501960}, // 240,000 >< 501,960 -- 34%
                {minSum: 501960, percentage: 0.48, maxSum: 811560}, // 501,960 >< 811,560 -- 48%
                {minSum: 811560, percentage: 0.5                 }, // 811,560 >          -- 50%
            ],
            2013: [
                {                percentage: 0.1,  maxSum: 63360},  // 0       >< 63,360  -- 10%
                {minSum: 63360,  percentage: 0.14, maxSum: 108120}, // 63,360  >< 108,120 -- 14%
                {minSum: 108120, percentage: 0.21, maxSum: 168000}, // 108,120 >< 168,000 -- 21%
                {minSum: 168000, percentage: 0.31, maxSum: 240000}, // 168,000 >< 240,000 -- 31%
                {minSum: 240000, percentage: 0.34, maxSum: 501960}, // 240,000 >< 501,960 -- 34%
                {minSum: 501960, percentage: 0.48, maxSum: 811560}, // 501,960 >< 811,560 -- 48%
                {minSum: 811560, percentage: 0.5                 }, // 811,560 >          -- 50%
            ],
        },

        // the yearly value of 1 allowance point
        // for the avg single israeli citizen above the age of 18, the allowance points amount is 2.25 for a male, 2.75 for a female
        // you can clac your allowance points here: https://secapp.taxes.gov.il/srsimulatorNZ/#/simulator or https://taxes.gov.il/Pages/TestNekudotZicuiCalculator.aspx
        allowancePointWorth: {
        	2021: 2616,
        	2020: 2628,
        	2019: 2616,
        	2018: 2592,
        	2017: 2580,
        },

        getIncomeTax: function(sum, allowancePoints, isYearlySum, year){

            year        = year || (new Date()).getFullYear();
            isYearlySum = (typeof isYearlySum == 'boolean') ? isYearlySum : true;

            // multiply by 12 months and calc as yearly sum
            if(!isYearlySum) sum = sum*12;

            var incomeSteps = this.incomeSteps[year];
            var incomeTax = getRequiredPaymentBySteps(sum, incomeSteps);


            // reduce tax allowance from the final tax sum
            if(allowancePoints){
                var allowance = allowancePoints * this.allowancePointWorth[year];
                incomeTax = (incomeTax - allowance > 0) ? Math.round(incomeTax - allowance) : 0;
            }

            // divide by 12 months to return the monthly sum
            if(!isYearlySum) incomeTax = incomeTax/12;

            return parseFloat(incomeTax.toFixed(2));
        }
    };
})();

var RequiredPension = (function() {
    return {
        // the steps of the required pension rates
        // every step indicates a salary cap, minimum and it's own percentage
        // the default minimum is 0, the default cap is infinite
        pensionSteps: {
            2021: {
                selfEmployed: [
                    {                   percentage: 0.0445, maxSum: 63306},   // 0        >< 74,640   -- 4.45%
                    {minSum: 63306,     percentage: 0.1255, maxSum: 126612},  // 74,640   >< 116,076  -- 12.55%
                ],
                hired: [
                    {                   percentage: 0.06                  },  // 0        >           -- 6%
                ]
            },
            2020: {
                selfEmployed: [
                    {                   percentage: 0.0445, maxSum: 58038},   // 0        >< 74,640   -- 4.45%
                    {minSum: 58038,     percentage: 0.1255, maxSum: 116076},  // 74,640   >< 116,076  -- 12.55%
                ],
                hired: [
                    {                   percentage: 0.06                  },  // 0        >           -- 6%
                ]
            },
            2019: {
                selfEmployed: [
                    {                   percentage: 0.0445, maxSum: 58038},   // 0        >< 74,640   -- 4.45%
                    {minSum: 58038,     percentage: 0.1255, maxSum: 116076},  // 74,640   >< 116,076  -- 12.55%
                ],
                hired: [
                    {                   percentage: 0.06                  },  // 0        >           -- 6%
                ]
            },
            2018: {
                selfEmployed: [
                    {                   percentage: 0.0445, maxSum: 58038},   // 0        >< 74,640   -- 4.45%
                    {minSum: 58038,     percentage: 0.1255, maxSum: 116076},  // 74,640   >< 116,076  -- 12.55%
                ],
                hired: [
                    {                   percentage: 0.06                  },  // 0        >           -- 6%
                ]
            },
            2017: {
                selfEmployed: [
                    {                   percentage: 0.0445, maxSum: 58038},   // 0        >< 74,640   -- 4.45%
                    {minSum: 58038,     percentage: 0.1255, maxSum: 116076},  // 74,640   >< 116,076  -- 12.55%
                ],
                hired: [
                    {                   percentage: 0.06                  },  // 0        >           -- 6%
                ]
            },
        },

        getRequiredPension: function(sum, workerType, isYearlySum, year){

            year        = year || (new Date()).getFullYear();
            workerType  = workerType || 'selfEmployed';
            isYearlySum = (typeof isYearlySum == 'boolean') ? isYearlySum: true;

            // multiply by 12 months and calc as yearly sum
            if(!isYearlySum) sum = sum*12;

            var pensionSteps = this.pensionSteps[year][workerType];
            var requiredPension = getRequiredPaymentBySteps(sum, pensionSteps);

            /* var sumForStep, minSumForStep, maxSumForStep,
                requiredPension = 0;


            // loop through the pension steps
            for (var i = 0; i < pensionSteps.length; i++) {
                minSumForStep = pensionSteps[i].minSum || 0;
                maxSumForStep = Math.min(sum, (pensionSteps[i].maxSum || sum));
                sumForStep    = maxSumForStep - minSumForStep;

                requiredPension += sumForStep * pensionSteps[i].percentage;

                if (sum == maxSumForStep) break;
            } */

            // divide by 12 months to return the monthly sum
            if(!isYearlySum) requiredPension = requiredPension/12;

            return parseFloat(requiredPension.toFixed(2));
        }
    };
})();
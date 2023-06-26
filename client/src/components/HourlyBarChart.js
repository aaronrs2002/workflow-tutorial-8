import React, { Component, ReactDOM, useState, useEffect } from "react";
import timestamp from "./timestamp";
import ApexCharts from 'apexcharts';
import ReactApexChart from 'react-apexcharts';




const HourlyBarChart = (props) => {

    let [categories, setCategories] = useState([]);
    let [totals, setTotals] = useState([]);
    let [loaded, setLoaded] = useState(false);
    let year = timestamp(new Date()).substring(0, 4);
    let month = timestamp(new Date()).substring(5, 7);
    let day = timestamp(new Date()).substring(8, 10);
    let [counter, setCounter] = useState([]);

    var options = {

        series: [{
            data: totals
            // data: [totals[0], totals[1], totals[2], totals[3], totals[4], totals[5], totals[6], totals[7], totals[8], totals[9], totals[10], totals[11], totals[12], totals[13], totals[14], totals[15], totals[16], totals[17], totals[18], totals[19], totals[20], totals[21], totals[22], totals[23], totals[24], totals[25], totals[26], totals[27]]
        }],
        chart: {
            type: 'bar',
            height: 430
        },
        plotOptions: {
            bar: {
                horizontal: true,
                dataLabels: {
                    position: 'top',
                },
            }
        },
        dataLabels: {
            enabled: true,
            offsetX: -6,
            style: {
                fontSize: '12px',
                colors: ['#fff']
            }
        },
        stroke: {
            show: true,
            width: 1,
            colors: ['#fff']
        },
        tooltip: {
            shared: true,
            intersect: false
        },
        xaxis: {
            categories
        },
    };

    const addUpDayTotals = (data) => {

        console.log("JSON.stringify(data): " + JSON.stringify(data));
        let daysList = [];
        let daysTotal = [];
        let endDateYear = document.querySelector("[name='dateEndYear']").value;
        let endDateMonth = document.querySelector("[name='dateEndMonth']").value;
        const endDate = endDateYear + "-" + endDateMonth;
        for (let i = 0; i < data.length; i++) {
            if (endDate !== "default") {
                let dateHere = timestamp(new Date(data[i].timeIn));
                dateHere = dateHere.toString();
                if (dateHere.indexOf(endDate) !== -1) {
                    dateHere = dateHere.toString().substring(0, 10)
                    if (daysList.indexOf(dateHere) === -1) {
                        daysList.push(dateHere);
                        daysTotal.push(0);
                    }
                }

                for (let i = 0; i < daysList.length; i++) {
                    for (let j = 0; j < data.length; j++) {
                        let dateHere = new Date(Number(data[j].timeIn));
                        dateHere = dateHere.toString();
                        let yrMoSelected = daysList[i].substring(0, 7);
                        if (data[j].timeOut !== "noTimeYet" && yrMoSelected === timestamp(dateHere).substring(0, 7)) {
                            let tempNum = (daysTotal[i] + Number(((((data[i].timeOut - data[i].timeIn) / 1000) / 60) / 60).toFixed(2)))
                            daysTotal[i] = parseFloat(tempNum).toFixed(2);
                        }
                    }
                }
                setCategories((categories) => daysList);
                setTotals((totals) => daysTotal);
            }
        }//end end date
    }

    useEffect(() => {
        if (loaded === false && localStorage.getItem(props.email + ":timeClock")) {
            let tempCounter = [];

            for (let i = 1; i < 32; i++) {
                if (i < 10) {
                    i = "0" + i;
                }
                tempCounter.push(i);
            }
            setCounter((counter) => tempCounter);
            setTimeout(() => {
                addUpDayTotals(JSON.parse(localStorage.getItem(props.email + ":timeClock")));
            }, 2000)

            setLoaded((loaded) => true);


        }
    })

    return (

        <div className="container">
            <div className="row">



                <div className="col-md-6">
                    <label>End Year</label>
                    <select name="dateEndYear" className="form-control" onChange={() => addUpDayTotals(JSON.parse(localStorage.getItem(props.email + ":timeClock")))}>
                        <option value={year}>{year}</option>
                        <option value={year - 1}>{year - 1}</option>

                    </select>
                </div>
                <div className="col-md-6">
                    <label>End Month</label>
                    <select name="dateEndMonth" className="form-control" onChange={() => addUpDayTotals(JSON.parse(localStorage.getItem(props.email + ":timeClock")))}>
                        <option value="default">Select Month</option>
                        {counter.length > 0 ? counter.map((num, i) => {
                            if (i < 13) {
                                return (<option value={num} key={i} >{num}</option>);
                            }


                        }) : null}
                    </select>
                </div>



                {totals.length > 0 ? <div className="col-md-12" id="chart">
                    <ReactApexChart options={options} series={options.series} type="bar" />
                </div> : null}
            </div>

        </div>


    );
}




export default HourlyBarChart;


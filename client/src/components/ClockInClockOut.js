import React, { useEffect, useState } from "react";
import timestamp from "./timestamp";
import HourlyBarChart from "./HourlyBarChart";

const ClockInOut = (props) => {
    let [time, setTime] = useState("");
    let second = 0;
    let minute = 0;
    let hour = 0;
    let [runTimer, setRunTimer] = useState(true);
    let [loaded, setLoaded] = useState(false);
    let [timeClock, setTimeClock] = useState([]);
    let [clockedIn, setClockedIn] = useState(false);
    let [totalHours, setTotalHours] = useState(0);



    const getTotal = (data) => {
        let tempTotal = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i].timeOut !== "noTimeYet") {
                tempTotal = Number(tempTotal) + Number(((((data[i].timeOut - data[i].timeIn) / 1000) / 60) / 60).toFixed(2));
            }
        }
        setTotalHours((totalHours) => tempTotal);

    }


    const filterHours = () => {
        getTotal([]);
        setTimeClock((timeClock) => []);
        let tempData = [];
        let filterVal = document.querySelector("input[name='filter']").value;
        const tempInOrOut = JSON.parse(localStorage.getItem(props.email + ":timeClock"));
        for (let i = 0; i < tempInOrOut.length; i++) {
            let dateStr = timestamp(tempInOrOut[i].timeIn);
            if (dateStr.indexOf(filterVal) !== -1) {
                tempData.push(tempInOrOut[i]);
            }
        }
        getTotal(tempData);
        setTimeClock((timeClock) => tempData);

    }


    const inOut = (inOrOut) => {
        let tempInOrOut = [];
        if (inOrOut === "in") {

            if (localStorage.getItem(props.email + ":timeClock")) {
                tempInOrOut = JSON.parse(localStorage.getItem(props.email + ":timeClock"));
                tempInOrOut.push({
                    timeIn: Date.now(), timeOut: "noTimeYet"
                });
                localStorage.setItem(props.email + ":timeClock", JSON.stringify(tempInOrOut))
            } else {
                tempInOrOut = [{ timeIn: Date.now(), timeOut: "noTimeYet" }];
                localStorage.setItem(props.email + ":timeClock", JSON.stringify(tempInOrOut))
            }
            setClockedIn((clockedIn) => true);
        } else {
            if (localStorage.getItem(props.email + ":timeClock")) {
                tempInOrOut = JSON.parse(localStorage.getItem(props.email + ":timeClock"));
                getTotal(tempInOrOut);
                console.log("JSON.stringify(tempInOrOut): " + JSON.stringify(tempInOrOut));
                if (tempInOrOut[tempInOrOut.length - 1].timeOut === "noTimeYet") {
                    tempInOrOut[tempInOrOut.length - 1].timeOut = Date.now();
                }

                localStorage.setItem(props.email + ":timeClock", JSON.stringify(tempInOrOut));
                setTimeout(() => {
                    getTotal(tempInOrOut);
                }, 1000);
            }
            setClockedIn((clockedIn) => false);

        }
        setTimeClock((timeClock) => tempInOrOut);

    }




    const addSecond = () => {

        if (runTimer !== false) {

            let tempSecond = Number(second);
            let tempMinute = Number(minute);
            let tempHour = Number(hour);
            tempSecond = second + 1;
            second = Number(second) + 1;
            if (tempSecond >= 60) {
                tempMinute = (Number(tempMinute) + 1);
                minute = tempMinute;
                tempSecond = 0;
                second = 0;
            }
            if (tempMinute >= 60) {
                tempHour = (Number(tempHour) + 1);
                hour = tempHour;
                tempMinute = 0;
                minute = 0;
            }
            if (tempSecond < 10) {
                tempSecond = "0" + tempSecond;
            }
            if (tempMinute < 10) {
                tempMinute = "0" + tempMinute;
            }
            if (tempHour < 10) {
                tempHour = "0" + tempHour;
            }
            setTime((time) => tempHour + ":" + tempMinute + ":" + tempSecond); return false;
        } else {
            clearInterval(addSecond);
            return false;
        }


    }



    const startTimer = (trueFalse) => {
        if (runTimer !== false) {
            setRunTimer((runTimer) => true);
            setInterval(addSecond, 1000)
        } else {
            setTime((time) => "");
            setRunTimer((runTimer) => false);
            clearInterval(addSecond);
            console.log("TRIED TO STOP!");

            return false;
        }


    }



    useEffect(() => {
        if (loaded === false && props.email) {
            if (localStorage.getItem(props.email + ":timeClock")) {
                let tempData = JSON.parse(localStorage.getItem(props.email + ":timeClock"));
                getTotal(tempData);

                setTimeClock((timeClock) => tempData);
                if (tempData[tempData.length - 1].timeOut === "noTimeYet") {
                    setClockedIn((clockedIn) => true)
                }
            }
            setLoaded((loaded) => true);
        }
    });

    //[{"timeIn":1648241326300,"timeOut":1648241591265}]



    return (

        <div className="row mb-5">

            <div className="col-md-12">
                <h2>Clock IN/OUT </h2>
                <div className="list-group mb-3">
                    {clockedIn === false ?
                        <button type="button" className="list-group-item list-group-item-success" onClick={() => inOut("in")}>Clock In</button> :
                        <button type="button" className="list-group-item list-group-item-danger" onClick={() => inOut("out")}>Clock Out</button>}
                </div>
                {timeClock.length > 0 ? <input type="text" name="filter" className="form-control" placeholder="Filter hours" onChange={() => filterHours()} /> : null}
                <ul className="list-group" id="clockInOutWindow">
                    {timeClock ?
                        timeClock.map((tc, i) => {
                            if (tc.timeOut !== "noTimeYet") {
                                return (<li className="list-group-item" key={i}>{timestamp(tc.timeIn) + " - " + timestamp(tc.timeOut) + " Worked: " + ((((tc.timeOut - tc.timeIn) / 1000) / 60) / 60).toFixed(2) + " Hours"}</li>)
                            } else {
                                return (<li className="list-group-item list-group-item-light" key={i}>{timestamp(tc.timeIn) + " - Currently working."}</li>)
                            }
                        })
                        : null}
                </ul>
                <hr />
                <h3 className="my-3">Total Hours: {totalHours.toFixed(3)}</h3>
            </div>
            <div className="col-md-12">
                <HourlyBarChart email={props.email} />
            </div>

            <div className="col-md-12 hide">
                <h2>Clock Timer </h2>
                <div className="list-group mb-3">
                    {time.length === 0 ? <button className="list-group-item list-group-item-success" onClick={() => startTimer(true)}>Start Timer</button> :
                        <button className="list-group-item list-group-item-danger" onClick={() => startTimer(false)}>Stop Timer</button>
                    }
                </div><h2>Time:{time}</h2>
                {time.length !== "" ? <button className="btn btn-block" onClick={() => startTimer(false)}>Reset Timer</button> : null}
            </div>
        </div>
    )

}

export default ClockInOut;


/*
January:$ $2640.69
February: $2640.69
March: $2761.16

*/

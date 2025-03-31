import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import "react-calendar/dist/Calendar.css";
import "../css/mahaHolidayCalendar.css";
import Dashboard from "../components/Dashboard";

const API_URL = process.env.REACT_APP_API_URL;

const MahaHolidayCalendar = () => {
    const [holidays, setHolidays] = useState([]);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        axios.get(`${API_URL}/holiday/holidays`)
            .then(response => setHolidays(response.data))
            .catch(error => console.error("Error fetching holidays:", error));
    }, []);

    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
    };

    const tileContent = ({ date, view }) => {
        if (view === "month") {
            const holiday = holidays.find(h => {
                const holidayDate = parseDate(h.date);
                return date.toDateString() === holidayDate.toDateString();
            });
            return holiday ? <div className="holiday-marker">{`${holiday.holiday} - ${holiday.holidayType}`}</div> : null;
        }
    };

    const tileClassName = ({ date, view }) => {
        if (view === "month") {
            const isSunday = date.getDay() === 0;
            const isHoliday = holidays.some(h => parseDate(h.date).toDateString() === date.toDateString());
            
            if (isHoliday) return "holiday-tile";
            if (isSunday) return "sunday-tile";
            return "normal-tile";
        }
    };

    return (
        <>
        <Dashboard />
        <div className="calendar-container">
            <h2>Holiday Calendar</h2>
            <div className="calendar-navigation">
                <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}>❮ Prev</button>
                <span className="month-year">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}>Next ❯</button>
            </div>
            <Calendar
                onChange={setDate}
                value={date}
                tileContent={tileContent}
                tileClassName={tileClassName}
                className="custom-calendar"
            />
        </div></>
    );
};

export default MahaHolidayCalendar;

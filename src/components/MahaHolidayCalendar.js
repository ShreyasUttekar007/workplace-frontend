import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import "react-calendar/dist/Calendar.css";
import "../css/mahaHolidayCalendar.css";
import Dashboard from "../components/Dashboard";

const API_URL = process.env.REACT_APP_API_URL;

const HolidayCalendar = () => {
    const [holidays, setHolidays] = useState([]);
    const [filteredHolidays, setFilteredHolidays] = useState([]);
    const [date, setDate] = useState(new Date());
    const [location, setLocation] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const loc = await localforage.getItem("location");
                setLocation(loc);
                const response = await api.get(`${API_URL}/holiday/holidays`);
                setHolidays(response.data);

                const filtered = response.data.filter(
                    h => h.state?.toLowerCase() === loc?.toLowerCase()
                );
                setFilteredHolidays(filtered);
            } catch (error) {
                console.error("Error fetching holidays:", error);
            }
        };
        fetchData();
    }, []);

    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
    };

    const tileContent = ({ date, view }) => {
        if (view === "month") {
            const holiday = filteredHolidays.find(h =>
                parseDate(h.date).toDateString() === date.toDateString()
            );
            return holiday ? (
                <div className="holiday-marker">
                    {`${holiday.holiday} - ${holiday.holidayType}`}
                </div>
            ) : null;
        }
    };

    const tileClassName = ({ date, view }) => {
        if (view === "month") {
            const holiday = filteredHolidays.find(h =>
                parseDate(h.date).toDateString() === date.toDateString()
            );

            if (holiday) {
                const type = holiday.holidayType?.toLowerCase();
                if (type.includes("national")) return "holiday-tile national-holiday";
                if (type.includes("restricted")) return "holiday-tile restricted-holiday";
                if (type.includes("fixed")) return "holiday-tile fixed-holiday";
                return "holiday-tile";
            }

            if (date.getDay() === 0) return "sunday-tile";
            return "normal-tile";
        }
    };

    return (
        <>
            <Dashboard />
            <div className="calendar-container">
                <h2>Holiday Calendar ({location})</h2>
                <div className="calendar-navigation">
                    <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}>
                        ❮ Prev
                    </button>
                    <span className="month-year">
                        {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}>
                        Next ❯
                    </button>
                </div>
                <Calendar
                    onChange={setDate}
                    value={date}
                    tileContent={tileContent}
                    tileClassName={tileClassName}
                    className="custom-calendar"
                />

                {/* LEGEND */}
                <div className="calendar-legend">
                    <h4>Legend</h4>
                    <div className="legend-items">
                        <div className="legend-item">
                            <span className="legend-box national-color"></span>
                            National Holiday
                        </div>
                        <div className="legend-item">
                            <span className="legend-box restricted-color"></span>
                            Restricted Holiday
                        </div>
                        <div className="legend-item">
                            <span className="legend-box fixed-color"></span>
                            Fixed Holiday
                        </div>
                        <div className="legend-item">
                            <span className="legend-box sunday-color"></span>
                            Sunday
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HolidayCalendar;

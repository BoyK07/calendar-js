async function getEvents() {
    try {
        const response = await fetch("http://localhost:3000/events");
        const events = await response.json();
        console.debug(events);
        return events;
    } catch (error) {
        console.log(error);
        // Return placeholder events
        return [
            {
                id: 1,
                title: "TESTvergadering",
                start: new Date().setHours(10, 0, 0, 0),
                end: new Date().setHours(11, 0, 0, 0),
            },
            {
                id: 2,
                title: "TESTproject deadline",
                start: new Date(new Date().getTime() + 86400000),
                allDay: true,
            },
        ];
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    let calendar;

    calendar = new FullCalendar.Calendar(document.getElementById("calendar"), {
        initialView: "dayGridMonth",
        headerToolbar: {
            left: "prev today next",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        editable: true,
        events: await getEvents(),
        buttonText: {
            today: "Vandaag",
            month: "Maand",
            week: "Week",
            day: "Dag",
        },
        // Add a double click event to show event details instead of single click
        eventDidMount: function (info) {
            info.el.addEventListener("dblclick", function () {
                showEventDetails(info.event);
            })
        }
    });
    calendar.render();

    function updateTime() {
        const now = new Date();
        document.title = `Kalender - ${now.toLocaleTimeString()}`;
    }
    setInterval(updateTime, 1000);

    function reloadCalendar() {
        calendar.refetchEvents();
    }
    setInterval(reloadCalendar, 300000) // 5 minutes in milliseconds

    // Expose calendar to global scope for event management
    window.calendarInstance = calendar;
});
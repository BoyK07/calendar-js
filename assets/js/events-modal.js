document.addEventListener("DOMContentLoaded", function () {
    const containerId = document.getElementById("container");
    const eventModal = document.getElementById("eventModal");
    const addEventBtn = document.getElementById("addEventButton");
    const cancelEventBtn = document.querySelectorAll(".cancel-button");
    const deleteEventBtn = document.getElementById("deleteEventBtn");
    const eventForm = document.getElementById("eventForm");
    const allDayEventCheckbox = document.getElementById("eventAllDay");
    const eventTime = document.getElementById("eventTime");
    const modalTitle = document.getElementById("modalTitle");
    var eventExists = false;

    /*
    * Check if an event exists and update the modal accordingly
    */
    function eventExistHandles(event) {
        if (event) {
            eventExists = true;
            modalTitle.textContent = "Evenement bewerken";
            deleteEventBtn.style.display = "block";

            // Check if the checkbox should be checked, if the event is an all day event. If it is, disable the time inputs, otherwise enable them
            if (event.allDay) {
                allDayEventCheckbox.checked = true;
                eventTime.style.display = "none";
                document.getElementById("eventStart").setAttribute("disabled", true);
                document.getElementById("eventEnd").setAttribute("disabled", true);
            } else {
                allDayEventCheckbox.checked = false;
                eventTime.style.display = "block";
                document.getElementById("eventStart").removeAttribute("disabled");
                document.getElementById("eventEnd").removeAttribute("disabled");
            }
        } else { 
            // If event does not exist, reset the modal
            allDayEventCheckbox.checked = false;
            eventTime.style.display = "block";

            eventExists = false;
            modalTitle.textContent = "Nieuw evenement";
            deleteEventBtn.style.display = "none";
        }
    }
    
    /*
    * Open and close the event modal
    * If an existing event is passed, the modal will be opened with the event details pre-filled
    * Otherwise, the modal will be opened with empty fields
    */
    function openEventModal(existingEvent = null) {
        eventForm.reset();
        
        eventExistHandles(existingEvent);
        if (existingEvent) {
            document.getElementById("eventID").value = existingEvent.id;
            document.getElementById("eventTitle").value = existingEvent.title;
            document.getElementById("eventStart").value = formatDateForInput(
                existingEvent.start
            );
            document.getElementById("eventEnd").value = formatDateForInput(
                existingEvent.end || existingEvent.start
            );
        } else {
            const now = new Date();
            document.getElementById("eventStart").value = formatDateForInput(now);
    
            const endTime = new Date(now.getTime() + 60 * 60 * 1000);
            document.getElementById("eventEnd").value = formatDateForInput(endTime);
        }
    
        containerId.classList.add("modalOverlay");
        
        eventModal.style.display = "block";
    }
    
    /*
    * Close the event modal
    */
    function closeEventModal() {
        containerId.classList.remove("modalOverlay");
        eventModal.style.display = "none";
    }

    /*
    * Format a date object or string to a date input value
    */
    function formatDateForInput(date) {
        if (!date) return "";

        const dateObj = date instanceof Date ? date : new Date(date);

        return dateObj.toISOString().slice(0, 16);
    }

    /*
    * Show the event details in the modal
    */
    function showEventDetails(event) {
        openEventModal(event);
    }

    /*
    * Event listeners for opening and closing the event modal
    */
    addEventBtn.addEventListener("click", () => {
        openEventModal();
    });

    cancelEventBtn.forEach((btn) => {
        btn.addEventListener("click", closeEventModal);
    });

    deleteEventBtn.addEventListener("click", () => {
        const id = document.getElementById("eventID").value;

        if (window.calendarInstance) {
            window.calendarInstance.getEventById(id).remove();
            saveEvent("DELETE", id);
        }

        closeEventModal();
    });

    /*
    * Check if the "All Day" checkbox is checked
    * If checked, disable the start and end time inputs
    * Otherwise, enable the inputs
    */
    allDayEventCheckbox.addEventListener("change", (e) => {
        const startInput = document.getElementById("eventStart");
        const endInput = document.getElementById("eventEnd");

        if (e.target.checked) {
            eventTime.style.display = "none";
            startInput.setAttribute("disabled", true);
            endInput.setAttribute("disabled", true);
        } else {
            eventTime.style.display = "block";
            startInput.removeAttribute("disabled");
            endInput.removeAttribute("disabled");
        }
    });

    /*
    * Handle saving the event to the backend
    */
    async function saveEvent(method, eventData) {
        var response = ""; // Placeholder for the response
        try {
            switch (method) {
                case "POST":
                    response = await fetch("http://localhost:3000/events", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(eventData),
                    });
                    break;

                case "PUT":
                    response = await fetch(`http://localhost:3000/events/${eventData.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(eventData),
                    });
                    break;

                case "DELETE":
                    response = await fetch(`http://localhost:3000/events/${eventData}`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.log(error);
            return false;
        }

        // No need to do anything with the response
        // const newEvent = await response.json();
        return true;
    }

    /*
    * Handle the form submission
    */
    eventForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("eventTitle").value;
        const start = document.getElementById("eventStart").value;
        const end = document.getElementById("eventEnd").value;
        var id = 0;

        // Get the latest available Id if this is a new event, otherwise just get the event ID
        if (eventExists) {
            id = document.getElementById("eventID").value;
        } else {
            // console.log(window.calendarInstance.getEvents());
            id = window.calendarInstance.getEvents().length + 1;
        }

        if (!title.trim()) {
            alert("Voer een titel in voor het evenement");
            return;
        }

        if (new Date(end) < new Date(start)) {
            alert("De eindtijd moet na de starttijd liggen");
            return;
        }

        const eventData = {
            id: id,
            title: title,
            start: start,
            end: end,
            allDay: allDayEventCheckbox.checked,
        };

        // Use the global calendar instance
        if (window.calendarInstance) {
            // If the event exists, remove it and add the updated event to prevent duplicates
            if (eventExists) {
                window.calendarInstance.getEventById(id).remove();
            }
            window.calendarInstance.addEvent(eventData);
            await saveEvent(eventExists ? "PUT" : "POST", eventData);
        }

        closeEventModal();
    });

    // Expose functions to global scope for event management
    window.showEventDetails = showEventDetails;
});
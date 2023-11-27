function app() {
    const searchbar = document.querySelector("form.searchbar");
    const menuControllers = document.querySelectorAll(".dropdown-menu-controller");
    const menuContainers = document.querySelectorAll(".dropdown-menu-container");
    const trialAlertContainer = document.querySelector("#trial-alert");
    const closeTrialAlertBtn = document.querySelector(".close-alert");
    const setupGuideContainer = document.querySelector("#setup-guide");
    const completedGuidesNumEl = document.querySelector("#completed-guides");
    const progressBar = document.getElementById("progress-bar");
    const setupGuideBody = document.querySelector("#setup-guide-body");
    const setupGuideController = document.querySelector("#guides-toggle-btn");
    const guideSingles = document.querySelectorAll(".guide");
    const guideSingleControllers = document.querySelectorAll(".guide-controller");
    const guideSingleCheckboxes = document.querySelectorAll(".guide-checkbox");

    const MENU_TOGGLE_DELAY = 350; //Delay for dropdown menus to appear and disappear


    // LISTENERS
    // Onsubmit listener on searchbar to stop it from refreshing the page
    searchbar.addEventListener("submit", submitSearch);

    // Onclick listener on menu controllers to toggle their dropdown menus
    menuControllers.forEach(menuController => {
        menuController.addEventListener("click", toggleDropdownMenu);
    })

    // Onclick listener on button to close the trial alert bar
    closeTrialAlertBtn.addEventListener("click", closeTrialAlert);

    // Onclick listener on caret button to toggle setup guides list
    setupGuideController.addEventListener("click", toggleSetupGuides);

    // Onclick listener on single setup guide buttons to toggle their guide content 
    guideSingleControllers.forEach(controller => {
        controller.addEventListener("click", openGuideSingle);
    })

    // Onclick listener on guide checkboxes to mark/unmark guide as completed
    guideSingleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("click", handleCheckboxClick);
    })

    // Onclick listener on window to close any open menus when anywhere is clicked
    window.addEventListener("click", closeOpenMenus);

    // Onkeydown listener on window to respond appropriately when any menu is open and 
    // esc, or arrow keys are pressed
    window.addEventListener("keydown", handleMenuKeyPress);


    // CONTROLLERS AND UTILITY FUNCTIONS
    // Prevent form from refreshing page on submit
    function submitSearch(e) {
        e.preventDefault();
    }

    // Toggle dropdown menu when menu btn is clicked
    function toggleDropdownMenu(e) {
        // Get clicked btn as clickedEl especially because of the setTimeout later on, 
        // by which time e.currentTarget will be undefined
        const clickedEl = e.currentTarget;

        // Get id of controlled menu and use that to get the menu element
        const targetMenuId = clickedEl.getAttribute("aria-controls");
        const targetMenu = document.querySelector(`#${targetMenuId}`);

        // Get first focusable item in the menu
        const firstMenuItem = targetMenu.querySelector(".focusable-menu-item");

        setTimeout(() => {
            // If target menu is active remove the active class from it and 
            // set aria-expanded on the controller btn to false, else do the opposite
            if (targetMenu.classList.contains("menu-active")) {
                targetMenu.classList.remove("menu-active");
                clickedEl.setAttribute("aria-expanded", "false");
            } else {
                targetMenu.classList.add("menu-active");
                clickedEl.setAttribute("aria-expanded", "true");
            }

            // If there's an available first focusable item, set focus to it
            if (firstMenuItem) {
                firstMenuItem.focus();
            }
        }, MENU_TOGGLE_DELAY)
    }

    // Close any open dropdown menu
    function closeOpenMenus() {
        menuContainers.forEach(menuContainer => {
            // If menu is active, first get the id of its controller from the data-controller attribute,
            // then get the controller element with that
            if (menuContainer.classList.contains("menu-active")) {
                const menuControllerId = menuContainer.getAttribute("data-controller");
                const menuController = document.querySelector(`#${menuControllerId}`);

                // After a short delay make menu inactive and set the controller's aria-expanded to false
                setTimeout(() => {
                    menuContainer.classList.remove("menu-active");
                    menuController?.setAttribute("aria-expanded", "false");
                }, MENU_TOGGLE_DELAY)
            }
        })
    }

    // Close dropdown menu and return focus to its controller btn
    function closeMenuAndReturnFocus (menu) {
        const menuControllerId = menu.getAttribute("data-controller");
        const menuController = document.querySelector(`#${menuControllerId}`);

        setTimeout(() => {
            menu.classList.remove("menu-active");
            menuController?.setAttribute("aria-expanded", "false");
            menuController?.focus();
        }, MENU_TOGGLE_DELAY)
    }

    // Toggle list of all setup guides
    function toggleSetupGuides() {
        if (setupGuideContainer.classList.contains("show-guides")) {
            setupGuideContainer.classList.remove("show-guides");
            setupGuideController.setAttribute("aria-expanded", "false");
            setupGuideBody.setAttribute("aria-hidden", "true");
        } else {
            setupGuideContainer.classList.add("show-guides");
            setupGuideController.setAttribute("aria-expanded", "true");
            setupGuideBody.setAttribute("aria-hidden", "false");

            // Ensure it's the first setup guide that's open whenever the list of guides is opened
            openParticularGuide(0);
        }
    }

    // Toggle guide marked as completed and open next incomplete guide
    function handleCheckboxClick(e) {
        // Open the guide for that checkbox 
        openGuideSingle(e);
        const checkbox = e.currentTarget;

        // If guide is marked completed, unmark it and recalculate progress of the guides
        if (checkbox.classList.contains("completed")) {
            checkbox.classList.replace("completed", "dashed");
            handleGuidesProgress();
        } else {
            // Else, first replace the "dashed" class with "loading" to activate the spinner in the checkbox
            checkbox.classList.replace("dashed", "loading");

            // After the spinner animation replace the "loading" class with "completed" to 
            // show the guide is marked completed and recalculate progress
            setTimeout(() => {
                checkbox.classList.replace("loading", "completed");
                handleGuidesProgress();
            }, 200)

            // Open next incomplete guide after the marked complete animation
            setTimeout(() => {
                openNextIncompleteGuide();
            }, 200)
        }
    }

    // Open the 
    function openGuideSingle(e) {
        closeAllGuides();

        const guideIndex = e.currentTarget.id.slice(-1);

        guideSingles[guideIndex].classList.add("active-guide");
        guideSingleCheckboxes[guideIndex]?.setAttribute("aria-expanded", "true");
        guideSingleControllers[guideIndex]?.setAttribute("aria-expanded", "true");
    }

    function closeAllGuides() {
        guideSingles.forEach(guideSingle => {
            guideSingle.classList.remove("active-guide");
        })
        guideSingleCheckboxes.forEach(checkbox => {
            checkbox.setAttribute("aria-expanded", "false");
        })
        guideSingleControllers.forEach(controller => {
            controller.setAttribute("aria-expanded", "false");
        })
    }

    function handleGuidesProgress() {
        const numOfCompletedGuides = document.querySelectorAll(".guide-checkbox.completed").length;
        completedGuidesNumEl.innerHTML = numOfCompletedGuides;
        progressBar.style.width = `${numOfCompletedGuides * 20}%`;
    }

    function openParticularGuide (i) {
        closeAllGuides();

        guideSingles[i].classList.add("active-guide");
        guideSingleCheckboxes[i]?.setAttribute("aria-expanded", "true");
        guideSingleControllers[i]?.setAttribute("aria-expanded", "true");
        
        guideSingleCheckboxes[i].focus();
    }

    function openNextIncompleteGuide () {
        let nextIncompleteGuideIndex = -1;

        for(let i = 0; i < guideSingleCheckboxes.length; i++) {
            if (guideSingleCheckboxes[i].classList.contains("dashed")) {
                nextIncompleteGuideIndex = i;
                break;
            }
        }

        if (nextIncompleteGuideIndex >= 0) {
            openParticularGuide(nextIncompleteGuideIndex);
        }
    }

    function handleMenuKeyPress (e) {
        const { keyCode } = e;

        menuContainers.forEach(menuContainer => {
            if (menuContainer.classList.contains("menu-active")) {
                if (keyCode === 27) {
                    closeMenuAndReturnFocus(menuContainer);
                } else if ([39, 40].includes(keyCode)) {
                    goToNextFocusableMenuItem(menuContainer);
                } else if ([37, 38].includes(keyCode)) {
                    goToPreviousFocusableMenuItem(menuContainer);
                }
            }
        })
    }

    function goToNextFocusableMenuItem(menu) {
        const focusableMenuItems = menu.querySelectorAll(".focusable-menu-item");
        let indexOfFocusedItem = -1;

        for (let i = 0; i < focusableMenuItems.length; i++) {
            if (focusableMenuItems[i] === document.activeElement) {
                indexOfFocusedItem = i;
                break;
            }
        }

        if (indexOfFocusedItem > focusableMenuItems.length - 2) {
            focusableMenuItems[0].focus();
        } else {
            focusableMenuItems[indexOfFocusedItem + 1].focus();
        }
    }

    function goToPreviousFocusableMenuItem(menu) {
        const focusableMenuItems = menu.querySelectorAll(".focusable-menu-item");
        let indexOfFocusedItem = focusableMenuItems.length;

        for (let i = 0; i < focusableMenuItems.length; i++) {
            if (focusableMenuItems[i] === document.activeElement) {
                indexOfFocusedItem = i;
                break;
            }
        }

        if (indexOfFocusedItem <= 0) {
            focusableMenuItems[focusableMenuItems.length - 1].focus();
        } else {
            focusableMenuItems[indexOfFocusedItem - 1].focus();
        }
    }

    function closeTrialAlert () {
        trialAlertContainer.classList.add("hide");
    }
}
app();
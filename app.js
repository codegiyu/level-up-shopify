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
            // setupGuideBody.setAttribute("aria-hidden", "true");
        } else {
            setupGuideContainer.classList.add("show-guides");
            setupGuideController.setAttribute("aria-expanded", "true");
            // setupGuideBody.setAttribute("aria-hidden", "false");

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

    // Open the guide of the particular guide controller button that was clicked
    function openGuideSingle(e) {
        closeAllGuides(); // First close all guides

        // All guide controller and checkbox ids have been suffixed with the index of the guide they are in
        // Extract index from id by spliting by hyphens and taking the last string in the resulting array
        const guideIndex = e.currentTarget.id.split("-").at(-1);

        // With the index, target the guide in its nodelist and add "active-guide" class
        // Set aria-expanded to true for the corresponding checkbox and controller as well
        guideSingles[guideIndex].classList.add("active-guide");
        guideSingleCheckboxes[guideIndex].setAttribute("aria-expanded", "true");
        guideSingleControllers[guideIndex].setAttribute("aria-expanded", "true");
    }

    // Close all guides
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

    // Update completed guides and progress bar width
    function handleGuidesProgress() {
        // Get length of nodelist of guide checkboxes that are marked completed
        const numOfCompletedGuides = document.querySelectorAll(".guide-checkbox.completed").length;

        // Update span with number of completed guides
        completedGuidesNumEl.innerHTML = numOfCompletedGuides;

        // Update value and aria-valuenow of progress bar with number of completed guides
        progressBar.value = numOfCompletedGuides;
        progressBar.ariaValueNow = numOfCompletedGuides;
    }

    // Open guide with that index
    function openParticularGuide (i) {
        closeAllGuides();

        guideSingles[i].classList.add("active-guide");
        guideSingleCheckboxes[i]?.setAttribute("aria-expanded", "true");
        guideSingleControllers[i]?.setAttribute("aria-expanded", "true");
        
        // Set focus to checkbox in that guide
        guideSingleCheckboxes[i].focus();
    }

    // Open next incomplete guide (if any)
    function openNextIncompleteGuide () {
        // Start off guide index at -1 because it can be easily compared with other numbers
        let nextIncompleteGuideIndex = -1;

        // Loop through guide checkboxes
        for(let i = 0; i < guideSingleCheckboxes.length; i++) {
            // If any guide contains the "dashed" class, it is incomplete
            // Set nextIncompleteGuideIndex to that index and stop the loop
            if (guideSingleCheckboxes[i].classList.contains("dashed")) {
                nextIncompleteGuideIndex = i;
                break;
            }
        }

        // if nextIncompleteGuideIndex is a valid index, open guide with that index
        if (nextIncompleteGuideIndex >= 0) {
            openParticularGuide(nextIncompleteGuideIndex);
        }
    }

    // Handle keypress functionality for escape and arrow keys when any menu is open
    function handleMenuKeyPress (e) {
        const { keyCode } = e;

        menuContainers.forEach(menuContainer => {

            // If menu is active
            if (menuContainer.classList.contains("menu-active")) {

                if (keyCode === 27) {

                    // If key is "escape" key close menu and return focus to its controller btn
                    closeMenuAndReturnFocus(menuContainer);

                } else if ([39, 40].includes(keyCode)) {

                    // if key is arrow down or arrow right, move focus to the next focusable element in that menu
                    goToNextFocusableMenuItem(menuContainer);

                } else if ([37, 38].includes(keyCode)) {

                    // if key is arrow left or arrow up, move focus to the previous focusable element in that menu
                    goToPreviousFocusableMenuItem(menuContainer);
                }
            }
        })
    }

    // Move focus to the next focusable element in an open dropdown menu
    function goToNextFocusableMenuItem(menu) {
        // Get nodelist of all elements with the class "focusable-menu-item"
        const focusableMenuItems = menu.querySelectorAll(".focusable-menu-item");

        // Start off index of item with current focus at -1 for easy comparison and number operations
        let indexOfFocusedItem = -1;

        // Loop through focusable menu items
        for (let i = 0; i < focusableMenuItems.length; i++) {

            // If any element matches the active element (element that has focus) in that document,
            // set indexOfFocusedItem to that index and stop the loop
            if (focusableMenuItems[i] === document.activeElement) {
                indexOfFocusedItem = i;
                break;
            }
        }

        // If indexOfFocusedItem > the second highest index in focusableMenuItems then set focus to the first focusable item
        // Else add 1 to indexOfFocusedItem and set focus the item in focusableMenuItems at that index
        // That way even if no item in the menu originally had focus, the first focusable item would now have focus anyway
        if (indexOfFocusedItem > focusableMenuItems.length - 2) {
            focusableMenuItems[0].focus();
        } else {
            focusableMenuItems[indexOfFocusedItem + 1].focus();
        }
    }

    // Move focus to the next focusable element in an open dropdown menu
    function goToPreviousFocusableMenuItem(menu) {
        const focusableMenuItems = menu.querySelectorAll(".focusable-menu-item");
        let indexOfFocusedItem = focusableMenuItems.length;

        for (let i = 0; i < focusableMenuItems.length; i++) {
            if (focusableMenuItems[i] === document.activeElement) {
                indexOfFocusedItem = i;
                break;
            }
        }

        // If indexOfFocusedItem <= 0 then set focus to the last focusable item
        // That way even if no item in the menu originally had focus, the last focusable item would now have focus anyway
        // Else subtract 1 from indexOfFocusedItem and set focus the item in focusableMenuItems at that index
        if (indexOfFocusedItem <= 0) {
            focusableMenuItems[focusableMenuItems.length - 1].focus();
        } else {
            focusableMenuItems[indexOfFocusedItem - 1].focus();
        }
    }

    // Close trial alert bar
    function closeTrialAlert () {
        trialAlertContainer.classList.add("hide");

        closeTrialAlertBtn.setAttribute("aria-expanded", "false");
    }
}
app();
import 'normalize.css';
import './style.css';

// This variable stores the delayed function call that ends the opening/closing
// animations. In case the user clicks the toggle button multiple times in quick succession,
// the animation timeout will still only run once.
let animationTimeoutID = null;
let animationEndTime = null;

/**
 * Retrieves the animation speed from the CSS property.
 *
 * This method is preferred over hard coding the value, because there is a
 * single source of truth for the animation speed, so it cannot accidentally
 * become de-synced.
 *
 * To change the animation speed, change the CSS property
 * --menu-animation-duration, found in style.css.
 * @returns {string} The animation speed property as retrieved from CSS (e.g. '0.2s')
 */
function getAnimationDurationProperty() {
  return getComputedStyle(document.documentElement).getPropertyValue('--menu-animation-duration');
}

/**
 * Ends currently running nav animations.
 * @returns {void}
 */
function endAnimation() {
  const totalDuration = parseFloat(getAnimationDurationProperty()) * 1000;

  // The remaining time in the previously running animation.  If no
  // running animation, this is zero.
  const prevTimeLeft = animationEndTime ? animationEndTime - Date.now() : 0;

  // Setting the animation delay to a negative value advances the animation
  // to that time point.  In this case, we advance the animation to the point
  // where it was previously interrupted.
  document.documentElement.style.setProperty('--site-nav-animation-delay', `${-(prevTimeLeft / 1000).toFixed(4)}s`);

  // Since we are reversing the animation, the new time left is the total
  // duration minus the time left in the previous animation.
  const timeLeft = totalDuration - prevTimeLeft;

  // Set the new end time for this animation.
  animationEndTime = Date.now() + timeLeft;

  if (animationTimeoutID) {
    clearTimeout(animationTimeoutID);
  }

  animationTimeoutID = setTimeout(function () {
    document.body.classList.remove('menu-opening');
    document.body.classList.remove('menu-closing');
    animationEndTime = null; // reset the animation end time
  }, timeLeft);
}

/**
 * Opens the navigation menu.
 * @param {HTMLElement} navMenuContainer
 * @returns {void}
 */
function openNav(navMenuContainer) {
  const siteNav = document.getElementById('site-nav');
  const menuToggleButton = document.getElementById('site-nav-menu-toggle');

  // Trigger the animation end timeout.
  endAnimation();

  // Reveal the menu
  navMenuContainer.removeAttribute('hidden');
  siteNav.classList.add('open');

  // Change attributes for accessibility:
  // Screen readers and other assistive technologies may use these
  // attributes to give users context on what will happen if they activate
  // the button.
  menuToggleButton.setAttribute('aria-label', 'Close navigation menu');
  menuToggleButton.setAttribute('aria-expanded', 'true');

  // Add other classes:
  // Several animations will play when the menu is opening.
  // We also need to remove the menu-closing class in case the user
  // clicked the toggle button while the menu was still closing.
  document.body.classList.add('menu-is-open');
  document.body.classList.add('menu-opening');
  document.body.classList.remove('menu-closing');
  document.documentElement.style.setProperty('--gradient-background-offset', '50%');

  setTimeout(function () {
    // We use setTimeout because CSS won't transition properties if the
    // display property is changed from 'none' to 'block' on the same frame as
    // the transition starts.
    //
    // In this case, the hidden attribute uses display: none, so we need to add
    // the 'active' class on the next frame so that the properties attached to
    // the other classes will transition.
    navMenuContainer.classList.add('active');
  }, 0);
}

/**
 * Closes the navigation menu.
 * @param {HTMLElement} navMenuContainer
 * @returns {void}
 */
function closeNav(navMenuContainer) {
  const siteNav = document.getElementById('site-nav');
  const menuToggleButton = document.getElementById('site-nav-menu-toggle');

  // Trigger the animation end timeout.
  endAnimation();

  // Hide the menu and immediately remove the "active" class
  navMenuContainer.setAttribute('hidden', '');
  navMenuContainer.classList.remove('active');
  siteNav.classList.remove('open');

  // Change attributes for accessibility:
  // Screen readers and other assistive technologies may use these
  // attributes to give users context on what will happen if they activate
  // the button.
  menuToggleButton.setAttribute('aria-expanded', 'false');
  menuToggleButton.setAttribute('aria-label', 'Open navigation menu');

  // Trigger CSS animations that run when the menu is closing.
  // We also need to remove the menu-opening class in case the user
  // clicked the toggle button while the menu was still opening.
  document.body.classList.add('menu-closing');
  document.body.classList.remove('menu-opening');
  document.body.classList.remove('menu-is-open');
  document.documentElement.style.setProperty('--gradient-background-offset', '0%');
}

function onClickMenuToggleButton() {
  const navMenuContainer = document.getElementById('site-nav-menu-container');

  if (navMenuContainer.hasAttribute('hidden')) {
    // If the menu is currently hidden, clicking should show it.
    openNav(navMenuContainer);

  } else {
    // If the menu is currently showing, clicking should hide it.
    closeNav(navMenuContainer);
  }
}

// Add the click event handler to the toggle button element.
const menuToggleButton = document.getElementById('site-nav-menu-toggle');
menuToggleButton.addEventListener('click', onClickMenuToggleButton);

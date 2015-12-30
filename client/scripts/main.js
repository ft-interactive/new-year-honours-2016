/* eslint brace-style: 0, no-inner-declarations: 0 */

import oHoverable from 'o-hoverable';
import attachFastClick from 'fastclick';

let words = {};

document.addEventListener('DOMContentLoaded', () => {
  // make hover effects work on touch devices
  oHoverable.init();

  // remove the 300ms tap delay on mobile browsers
  attachFastClick(document.body);

  // make nav bar stuff work
  {
    const pageNav = document.querySelector('.page-nav');
    const navUL = pageNav.querySelector('ul');
    const navLinks = selectAll('a', navUL);
    const groups = selectAll('.group');
    const numGroups = groups.length;

    let navIsStuck;

    let currentGroupIndex;
    function setCurrentGroup(index) {
      if (currentGroupIndex !== undefined) navLinks[currentGroupIndex].classList.remove('current');
      if (index !== undefined) navLinks[index].classList.add('current');
      currentGroupIndex = index;
    }

    function onScroll() {
      const {top} = pageNav.getBoundingClientRect();

      if (navIsStuck) {
        if (top > 0) {
          // unstick
          navUL.classList.remove('stuck');
          navIsStuck = false;
        } else {
          // still stuck.

          // update the highlighted nav item
          (() => {
            const viewportHeight = window.innerHeight;
            let highestVisibleProportion = 0;
            let mostVisibleGroupIndex;
            for (let i = 0; i < numGroups; i++) {
              // find what proportion of the group is visible
              const group = groups[i];
              const {top, bottom, height} = group.getBoundingClientRect();

              let visibleHeight;
              if (top < 0) {
                if (bottom < 0) visibleHeight = 0; // offscreen past the top
                else visibleHeight = Math.min(height + top, viewportHeight); // going off the top
              }
              else if (top < viewportHeight) {
                if (bottom < viewportHeight) visibleHeight = height; // fully on screen
                else visibleHeight = viewportHeight - top; // going off the bottom
              }
              else visibleHeight = 0; // offscreen past the bottom

              const visibleProportion = visibleHeight / height;

              if (visibleProportion > 0.9) {
                // just go with this one as it's the first one that's (pretty much) fully in view.
                setCurrentGroup(i);
                return;
              }

              if (visibleProportion > highestVisibleProportion) {
                highestVisibleProportion = visibleProportion;
                mostVisibleGroupIndex = i;
              }
            }

            setCurrentGroup(mostVisibleGroupIndex);
          })();
        }
      }
      else {
        if (top <= 0) {
          // stick
          navUL.classList.add('stuck');
          navIsStuck = true;
        }

        // make sure no nav item highlighted
        setCurrentGroup();
      }
    }

    document.addEventListener('scroll', onScroll);
    window.addEventListener('load', onScroll);
    onScroll();

    // make clicking on a link jump to the relevant group, but with no history state
    navLinks.forEach((navLink, i) => {
      const group = groups[i];

      navLink.addEventListener('click', event => {
        event.preventDefault();

        console.log('top', group.getBoundingClientRect().top);
        console.log('pageYOffset', pageYOffset);

        window.scroll(
          0, (group.getBoundingClientRect().top + pageYOffset) - 90
        );

        onScroll();
      });
    });
  }
});

function selectAll(selector, parent = document) {
  return Array.prototype.slice.apply(parent.querySelectorAll(selector));
}

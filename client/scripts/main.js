import oHoverable from 'o-hoverable';
import attachFastClick from 'fastclick';

let words = {};

document.addEventListener('DOMContentLoaded', () => {
  // make hover effects work on touch devices
  oHoverable.init();

  // remove the 300ms tap delay on mobile browsers
  attachFastClick(document.body);
});

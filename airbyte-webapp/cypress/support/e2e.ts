import { requestWorkspaceId, completeInitialSetup } from "commands/api";
require("dd-trace/ci/cypress/support");

Cypress.on("window:load", (window) => {
  // Hide the react-query devtool button during tests, to it never accidentally overlaps some button
  // that cypress needs to click
  const style = document.createElement("style");
  style.setAttribute("data-style", "cypress-injected");
  style.textContent = `
    #react-query-devtool-btn { display: none !important; }
  `;
  window.document.head.appendChild(style);
});

before(() => {
  requestWorkspaceId().then(completeInitialSetup);
});

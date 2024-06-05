/**
 * Paginates the given data array based on the specified current page and page size.
 *
 * @param {Array} data - The array of data to paginate.
 * @param {number} currentPage - The current page number (1-based).
 * @param {number} pageSize - The number of items per page.
 * @returns {Array} - A subset of the data array corresponding to the current page.
 */
function paginate(data, currentPage, pageSize) {
  const startIndex = pageSize * (currentPage - 1);
  return data.slice(startIndex, startIndex + pageSize);
}

/**
 * Generates an array containing a range of integers from `low` (inclusive) to `high` (exclusive).
 *
 * @param {number} low - The lower bound of the range (inclusive).
 * @param {number} high - The upper bound of the range (exclusive).
 * @returns {number[]} - An array containing the range of integers.
 */
function range(low, high) {
  return Array.from({ length: high - low }, (_, i) => i + low);
}

/**
 * Generates a DOM element representing a card indicating that there are no table records.
 *
 * @returns {HTMLElement} - A DOM element for the "no records" card.
 */
function createNoRecordsCard() {
  // Create the card container
  const card = document.createElement("div");
  card.className = "card card--small";

  // Create the card body
  const cardBody = document.createElement("div");
  cardBody.className = "card__body items-center";
  card.appendChild(cardBody);

  // SVG icon as a string
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
</svg>`;

  // Set the innerHTML of the card body
  cardBody.innerHTML = `${svgString}<h4>No Entries Found</h4>`;

  return card;
}
function tablePage({
  container,
  changeHandlers,
  data = [],
  columns = [],
  pageSize = 20,
  showSearch = true,
  sortColumn = { key: columns[0].key, order: 1 },
  hasRefresh = false,
}) {
  if (!container) {
    throw new Error("Element not found.");
  }

  if (data.length === 0) {
    container.innerHTML = "";
    container.appendChild(createNoRecordsCard());
    if (!hasRefresh) return;
  }
  let filtered;
  let currentPage = 1;
  container.innerHTML = `<div class="root flow"><div class="table-container flow"></div></div>
`;
  if (showSearch) {
    container.querySelector(".root").innerHTML = `
      <div class="search-container">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="16" width="16" class="icon icon--muted" viewBox="0 -960 960 960"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
      <input type="text" class="search" placeholder="Search..">
    </div>
    <div class="table-container flow"></div>`;
    const searchInput = document.querySelector(".search");
    searchInput.addEventListener("keyup", function () {
      const searchTerm = searchInput.value.trim().toLowerCase();
      filterByTerm(searchTerm);
    });
  }

  function init() {
    filtered = data.slice();

    if (showSearch) {
      const searchInput = document.querySelector(".search");
      if (searchInput.value) {
        filterByTerm(searchInput.value);
        return;
      }
    }

    const index = columns.findIndex((col) => col.key === sortColumn.key);
    if (index === -1 || columns[index].ignoreFiltering) {
      render();
    } else {
      orderBy(sortColumn.key, true);
    }
  }
  init();

  function filterByTerm(searchTerm) {
    if (searchTerm.length) {
      currentPage = 1;
      filtered = data.filter((entry) => {
        for (let i = 0; i < columns.length; i++) {
          if (!columns[i].ignoreFiltering) {
            const field = String(entry[columns[i].key]);
            if (field) {
              if (field.toLowerCase().includes(searchTerm)) {
                return true;
              }
            }
          }
        }
        return false;
      });
    } else {
      filtered = data;
    }
    orderBy(sortColumn.key, true);
  }

  function orderBy(key, retainOrder = false) {
    sortColumn = {
      key,
      order:
        (sortColumn === null || sortColumn === void 0
          ? void 0
          : sortColumn.key) === key
          ? retainOrder
            ? sortColumn.order
            : sortColumn.order * -1
          : 1,
    };
    filtered.sort(function (a, b) {
      if (a[sortColumn.key] > b[sortColumn.key]) return 1 * sortColumn.order;
      if (a[sortColumn.key] < b[sortColumn.key]) return -1 * sortColumn.order;
      return 0;
    });
    currentPage = 1;
    render();
  }
  function createHeaderIcon(column) {
    if (column.ignoreFiltering) return "";
    if (sortColumn.key !== column.key) {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="icon" viewBox="0 0 24 24"><path d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" /></svg>';
    }
    if (sortColumn.order === 1) {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="icon" viewBox="0 0 24 24"><path d="M16 8.90482L12 4L8 8.90482M8 15.0952"/></svg>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="icon" viewBox="0 0 24 24"><path d="M16 8.90482M8 15.0952L12 20L16 15.0952" /></svg>';
  }

  function render() {
    const paginated = paginate(filtered, currentPage, pageSize);
    function createHead() {
      const html = [];
      html.push("<thead>");
      html.push('<tr scope="row">');
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].ignoreFiltering) {
          html.push(`<th scope="column">${columns[i].label}</th>`);
        } else {
          html.push(
            `<th data-key="${String(columns[i].key)}"><div>${
              columns[i].label
            } ${createHeaderIcon(columns[i])}</div></th>`
          );
        }
      }
      html.push("</tr>");
      html.push("</thead>");
      return html.join("");
    }
    function createBody() {
      const html = [];
      html.push("<tbody>");
      for (let j = 0; j < paginated.length; j++) {
        html.push('<tr scope="row">');
        for (let i = 0; i < columns.length; i++) {
          html.push('<td scope="col">');
          if (columns[i].cell) {
            html.push(columns[i].cell(paginated[j]));
          } else {
            html.push(paginated[j][columns[i].key]);
          }
          html.push("</td>");
        }
        html.push("</tr>");
      }
      html.push("</tbody>");
      return html.join("");
    }
    function createPagination() {
      const html = [];
      const pages = Math.ceil(filtered.length / pageSize);
      html.push("<div class='pagination-container'>");
      const startItemIndex = (currentPage - 1) * pageSize + 1;
      const endItemIndex = startItemIndex - 1 + paginated.length;
      html.push(
        `<span>Showing <strong>${startItemIndex}${
          startItemIndex !== endItemIndex ? ` to ${endItemIndex}` : " "
        }</strong> of <strong>${filtered.length}</strong> items.</span>`
      );
      if (pages > 1) {
        const paginationRange = 2;
        const ellipse = "...";
        const surroundStart = Math.max(1, currentPage - paginationRange);
        const surroundEnd = Math.min(pages, currentPage + paginationRange);
        const items = [];
        items.push(
          ...(surroundStart > 2 ? [1, ellipse] : surroundStart > 1 ? [1] : [])
        );
        items.push(...range(surroundStart, surroundEnd + 1));
        items.push(
          ...(surroundEnd < pages - 1
            ? [ellipse, pages]
            : surroundEnd < pages
            ? [pages]
            : [])
        );
        html.push("<nav aria-label='Pagination'>");
        html.push("<ul class='pagination'>");
        html.push(
          `<li>${
            currentPage === 1
              ? '<span class="pagination--disabled">'
              : `<a href="#" data-page=${currentPage - 1}>`
          }`
        );
        html.push(
          '<svg width="16" height="16" class="icon icon--small" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 1 1 5l4 4" /></svg>'
        );
        html.push(`${currentPage === 1 ? "</span>" : "</a>"}</li>`);
        for (let i = 0; i < items.length; i++) {
          const pageLabel = items[i];
          if (pageLabel === ellipse) {
            html.push(`<li><span>${ellipse}</span></li>`);
          } else {
            html.push(
              `<li><a href="#" ${
                currentPage === pageLabel
                  ? "class='active' aria-current='page'"
                  : ""
              } data-page=${pageLabel}>${pageLabel}</a></li>`
            );
          }
        }
        html.push(
          `<li>${
            currentPage === pages
              ? '<span class="pagination--disabled">'
              : `<a href="#" data-page=${currentPage + 1}>`
          }`
        );
        html.push(
          '<svg height="16" width="16" class="icon icon--small" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m1 9 4-4-4-4"/></svg>'
        );
        html.push(`${currentPage === 1 ? "</span>" : "</a>"}</li>`);
        html.push("</ul>");
        html.push("</nav>");
      }
      html.push("</div>");
      return html.join("");
    }
    if (filtered.length > 0) {
      container.querySelector(
        ".table-container"
      ).innerHTML = `<table class="table">${createHead()}${createBody()}</table>${createPagination()}`;
      const paginationItems = container.querySelectorAll(".pagination a");
      const sortableHeaders = container.querySelectorAll("[data-key]");
      sortableHeaders.forEach(function (header) {
        header.addEventListener("click", function () {
          orderBy(header.dataset.key);
        });
      });
      paginationItems.forEach(function (anchor) {
        anchor.addEventListener("click", function () {
          currentPage = parseInt(this.dataset.page);
          render();
        });
      });
      if (changeHandlers) {
        changeHandlers();
      }
    } else {
      const tableContainer = container.querySelector(".table-container");
      tableContainer.innerHTML = "";
      tableContainer.appendChild(createNoRecordsCard());
    }
  }
  function update(updated) {
    data = updated;
    init();
  }

  return update;
}


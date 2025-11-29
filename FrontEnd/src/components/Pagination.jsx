import React from "react";

function Pagination({ currentPage, totalPages, onClickPage }) {
  const handlePrev = () => {
    if (currentPage > 1) {
      onClickPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onClickPage(currentPage + 1);
    }
  };

  return (
    <div className="flex gap-3 mt-4 items-center">
      <button
        disabled={currentPage === 1}
        onClick={handlePrev}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>

      <h2 className="font-semibold">{currentPage}</h2>

      <button
        disabled={currentPage === totalPages}
        onClick={handleNext}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;

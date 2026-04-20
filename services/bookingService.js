const express = require("express");

const allowedTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled", "no_show"],
  completed: [],
  cancelled: [],
  no_show: []
};

exports.canChangeStatus = (from, to) => {
  return allowedTransitions[from]?.includes(to);
};
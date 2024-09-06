export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [0, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "header-max-length": [2, "always", 200],
    "body-max-line-length": [2, "always", 1000],
  },
};

import { sidebar } from "vuepress-theme-hope";

export const enSidebar = sidebar({
  "/web3": [
    {
      text: "Basic Knowledge",
      prefix: "basic/",
      icon: "info",
      link: "basic/",
    },
    {
      text: "Smart Contracts",
      prefix: "contracts/",
      icon: "emmet",
      link: "contracts/",
      collapsible: true,
      children: [
        {
          text: "Day 1",
          prefix: "day1/",
          link: "day1/",
        },
        {
          text: "Day 2",
          prefix: "day2/",
          link: "day2/",
        },
        {
          text: "Day 3",
          prefix: "day3/",
          link: "day3/",
        },
      ]
    },
  ],
  "/": [
    "",
    {
      icon: "discover",
      text: "Demo",
      prefix: "demo/",
      link: "demo/",
      children: "structure",
    },
    {
      text: "Docs",
      icon: "note",
      prefix: "guide/",
      children: "structure",
    },
    "slides",
  ],
});

import fs from "fs";

const path = "src/app/optimize/page.tsx";
const lines = fs.readFileSync(path, "utf8").split(/\r?\n/);

const motionClose = "</" + "motion.div" + ">";
const divClose = "</" + "motion.div" + ">".replace("motion.div", "div");

const toDivClose = [
  178, 447, 475, 497, 499, 543, 587, 602, 633,
  675, 677, 690, 701, 702, 703, 709, 717, 721, 723, 725, 726, 727,
];

for (const n of toDivClose) {
  const i = n - 1;
  if (lines[i]?.includes(motionClose)) {
    lines[i] = lines[i].replaceAll(motionClose, divClose);
  }
}

lines[173] = '        <div className="flex-1">';
lines[176] = '          <div className="mt-1.5 text-xs text-white/60">{sub}</motion.div>';
lines[176] = lines[176].replace(motionClose, divClose);

lines[713] = '                        <div className="flex items-start justify-between gap-2">';
lines[714] = "                          <div>";
lines[717] = "                          </motion.div>".replace("motion.div", "motion.div");
lines[717] = divClose;
lines[721] = divClose;
lines[723] = motionClose.replace("motion.div", "motion.div");
lines[723] = divClose;

fs.writeFileSync(path, lines.join("\n"));
console.log("motionClose:", motionClose, "motionClose:", divClose);

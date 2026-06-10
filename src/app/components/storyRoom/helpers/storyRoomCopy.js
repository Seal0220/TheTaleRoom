export function getLoadingSceneCopy(stageIndex, submittedInput) {
  if (stageIndex === 0) {
    return {
      detail: "說書人需要一點時間 · 微光聚攏 · 第一頁正在醒來",
      narration:
        "故事先在門縫裡亮起一點光。說書人需要多一點時間，把基底文本攤開，讓紙頁裡沉睡的場景慢慢有了呼吸；還不急著抵達答案，只等第一個畫面從夜色深處浮現。",
      objects: ["未翻開的書頁", "門縫微光", "安靜的呼吸"],
      title: "說書人仍在點燈",
    };
  }

  const reply = submittedInput?.trim()
    ? `「${truncateDisplayText(submittedInput.trim(), 42)}」`
    : "剛才那個選擇";

  return {
    detail: "說書人需要更多時間 · 場景重組 · 下一頁浮現",
    narration:
      `${reply} 還留在場景中央，像一小束沒有熄滅的光。說書人需要更多時間，正把它放進角色的影子、遠方的主線與尚未說出口的願望之間，等下一頁從沉默裡慢慢長出來。`,
    objects: ["回聲", "翻動的書頁", "慢慢聚攏的光"],
    title: "說書人仍在翻頁",
  };
}

export function truncateDisplayText(text, maxLength) {
  const characters = Array.from(text);

  if (characters.length <= maxLength) {
    return text;
  }

  return `${characters.slice(0, maxLength).join("")}...`;
}

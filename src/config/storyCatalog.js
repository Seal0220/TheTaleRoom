export const storyCatalog = [
  {
    id: "cinderella",
    title: "Cinderella",
    displayTitle: "灰姑娘",
    narrator: "Glass Slipper",
    displayNarrator: "說書人 · 玻璃鞋",
    theme: "Being seen",
    displayTheme: "被看見 · 被愛 · 童話幻境",
    prompt: "The ballroom waits for the part of you that has been overlooked.",
    displayPrompt: "舞會的燈正等著，那個長久被忽略的你慢慢被看見。",
    description:
      "A room for exhaustion, invisibility, tenderness, and the first moment of recognition.",
    displayDescription:
      "給疲憊、隱形感、溫柔與第一次被認出的時刻，一間安靜發亮的故事房。",
    emotions: ["neglect", "hope", "recognition"],
    accent: "rose",
    entranceAccent: "from-[#f4a8b8]/34 via-[#cf6f93]/18 to-[#2c1734]/82",
  },
  {
    id: "alice",
    title: "Alice's Dream Wonderland",
    displayTitle: "愛麗絲夢遊仙境",
    narrator: "Cheshire Cat",
    displayNarrator: "說書人 · 柴郡貓",
    theme: "Finding yourself",
    displayTheme: "迷惘 · 自我認同 · 混亂夢境",
    prompt: "The path bends where confusion begins to name itself.",
    displayPrompt: "路在迷惘命名自己的地方彎了彎，邀請你往裡走。",
    description:
      "A room for uncertainty, identity, contradiction, and curious self-recognition.",
    displayDescription:
      "給不確定、自我認同、矛盾與好奇的辨認，一間會改變形狀的夢境房。",
    emotions: ["confusion", "identity", "curiosity"],
    accent: "violet",
    entranceAccent: "from-[#8d63ff]/34 via-[#542b8f]/22 to-[#16183f]/86",
  },
  {
    id: "little-prince",
    title: "The Little Prince",
    displayTitle: "小王子",
    narrator: "Fox",
    displayNarrator: "說書人 · 狐狸",
    theme: "Learning attachment",
    displayTheme: "羈絆 · 想念 · 離別與成長",
    prompt: "The sunset keeps a place for what you still care about.",
    displayPrompt: "夕陽替你仍然在乎的事留了一個位置，也替想念留了光。",
    description:
      "A room for loneliness, memory, attachment, goodbye, and quiet meaning.",
    displayDescription:
      "給孤單、記憶、羈絆、告別與安靜的意義，一間靠近星光的故事房。",
    emotions: ["loneliness", "care", "growth"],
    accent: "gold",
    entranceAccent: "from-[#f4c76b]/38 via-[#a56a31]/18 to-[#111b35]/84",
  },
  {
    id: "emperor",
    title: "The Emperor's New Clothes",
    displayTitle: "國王的新衣",
    narrator: "Tailor",
    displayNarrator: "說書人 · 裁縫師",
    theme: "Telling the truth",
    displayTheme: "虛偽 · 真相 · 成人世界",
    prompt: "The mirror asks what you have been carrying for everyone else.",
    displayPrompt: "鏡子輕聲問你：那些為了別人而撐住的樣子，還重嗎？",
    description:
      "A room for performance, shame, social pressure, honesty, and courage.",
    displayDescription:
      "給表演、羞愧、群體壓力、誠實與勇氣，一間能把真相說出口的故事房。",
    emotions: ["pressure", "truth", "courage"],
    accent: "umber",
    entranceAccent: "from-[#8a6a4f]/32 via-[#3c2c2a]/22 to-[#0c0d12]/90",
  },
];

export function getStoryById(storyId) {
  return storyCatalog.find((story) => story.id === storyId);
}

function normalizeStoryRouteName(storyName) {
  if (!storyName) {
    return "";
  }

  try {
    return decodeURIComponent(storyName).trim();
  } catch {
    return storyName.trim();
  }
}

export function getStoryByRouteName(storyName) {
  const normalizedStoryName = normalizeStoryRouteName(storyName);

  return storyCatalog.find((story) => {
    const routeName = story.displayTitle ?? story.title;

    return routeName === normalizedStoryName;
  });
}

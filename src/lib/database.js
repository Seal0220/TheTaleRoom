const store = globalThis.__THE_TALE_ROOM_STORE__ ?? {
  records: [],
};

globalThis.__THE_TALE_ROOM_STORE__ = store;

export function insertRecord(record) {
  store.records.unshift(record);
  return record;
}

export function selectRecords() {
  return [...store.records];
}

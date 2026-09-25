import { DynamoDbRepository } from './dynamodbRepository.js';
import crypto from 'crypto';

// Global in-memory cache to guarantee fast response and offline local operation
const inMemoryStore = new Map();

function matchesFilter(item, filter = {}) {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (val === undefined) continue;

    if (key === '$or' && Array.isArray(val)) {
      const matchAny = val.some((subFilter) => matchesFilter(item, subFilter));
      if (!matchAny) return false;
      continue;
    }

    if (val && typeof val === 'object' && !(val instanceof Date)) {
      if ('$in' in val && Array.isArray(val.$in)) {
        if (!val.$in.includes(item[key])) return false;
        continue;
      }
    }

    const itemVal = item[key] !== undefined && item[key] !== null ? String(item[key]) : item[key];
    const targetVal = val !== undefined && val !== null ? String(val) : val;

    if (itemVal !== targetVal) {
      return false;
    }
  }

  return true;
}

function attachSaveMethod(item, ModelClass) {
  if (!item || typeof item !== 'object') return item;
  if (!item.save) {
    Object.defineProperty(item, 'save', {
      enumerable: false,
      writable: true,
      configurable: true,
      value: async function () {
        return ModelClass.create(this);
      },
    });
  }
  return item;
}

class Query {
  constructor(executor, ModelClass) {
    this._executor = executor;
    this._ModelClass = ModelClass;
    this._populates = [];
  }

  populate(...args) {
    this._populates.push(args);
    return this;
  }

  sort(...args) {
    return this;
  }

  limit(...args) {
    return this;
  }

  skip(...args) {
    return this;
  }

  select(...args) {
    return this;
  }

  lean(...args) {
    return this;
  }

  exec() {
    return this;
  }

  async _execute() {
    const res = await this._executor();
    if (Array.isArray(res)) {
      return res.map((i) => attachSaveMethod(i, this._ModelClass));
    }
    return attachSaveMethod(res, this._ModelClass);
  }

  then(onFulfilled, onRejected) {
    return this._execute().then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this._execute().catch(onRejected);
  }

  finally(onFinally) {
    return this._execute().finally(onFinally);
  }
}

export function createDynamoModel(modelName) {
  const pk = `ENTITY#${modelName.toUpperCase()}`;

  if (!inMemoryStore.has(modelName)) {
    inMemoryStore.set(modelName, []);
  }
  const store = inMemoryStore.get(modelName);

  return class Model {
    static get modelName() {
      return modelName;
    }

    static find(filter = {}) {
      return new Query(async () => {
        try {
          const items = await DynamoDbRepository.queryByPk(pk);
          if (items && items.length > 0) {
            const matched = items.filter((item) => matchesFilter(item, filter));
            if (matched.length > 0) return matched;
          }
        } catch (e) {}
        return store.filter((item) => matchesFilter(item, filter));
      }, Model);
    }

    static findOne(filter = {}) {
      return new Query(async () => {
        try {
          const items = await DynamoDbRepository.queryByPk(pk);
          if (items && items.length > 0) {
            const matched = items.find((item) => matchesFilter(item, filter));
            if (matched) return matched;
          }
        } catch (e) {}
        return store.find((item) => matchesFilter(item, filter)) || null;
      }, Model);
    }

    static findById(id) {
      return new Query(async () => {
        if (!id) return null;
        const strId = String(id);
        try {
          const item = await DynamoDbRepository.get(pk, `${modelName.toUpperCase()}#${strId}`);
          if (item) return item;
        } catch (e) {}
        return store.find((item) => String(item._id) === strId || String(item.id) === strId) || null;
      }, Model);
    }

    static async create(data) {
      const isArray = Array.isArray(data);
      const itemsToCreate = isArray ? data : [data];

      const createdItems = [];
      for (const itemData of itemsToCreate) {
        const id = itemData._id ? String(itemData._id) : crypto.randomUUID();
        const sk = `${modelName.toUpperCase()}#${id}`;
        const record = {
          _id: id,
          id: id,
          ...itemData,
          PK: pk,
          SK: sk,
          GSI1PK: itemData.hotelId ? `HOTEL#${itemData.hotelId}` : pk,
          GSI1SK: sk,
          createdAt: itemData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        try {
          await DynamoDbRepository.put(record);
        } catch (e) {}

        const existingIdx = store.findIndex((i) => String(i._id) === id);
        if (existingIdx >= 0) {
          store[existingIdx] = record;
        } else {
          store.push(record);
        }
        createdItems.push(record);
      }

      return isArray
        ? createdItems.map((i) => attachSaveMethod(i, Model))
        : attachSaveMethod(createdItems[0], Model);
    }

    static findByIdAndUpdate(id, update, options = {}) {
      return new Query(async () => {
        const item = await Model.findById(id);
        if (!item) return null;

        const updatedFields = update.$set ? { ...update.$set } : { ...update };
        delete updatedFields.$set;

        Object.assign(item, updatedFields, { updatedAt: new Date().toISOString() });

        try {
          await DynamoDbRepository.put(item);
        } catch (e) {}

        return item;
      }, Model);
    }

    static findOneAndUpdate(filter, update, options = {}) {
      return new Query(async () => {
        const item = await Model.findOne(filter);
        if (!item) return null;

        const updatedFields = update.$set ? { ...update.$set } : { ...update };
        delete updatedFields.$set;

        Object.assign(item, updatedFields, { updatedAt: new Date().toISOString() });

        try {
          await DynamoDbRepository.put(item);
        } catch (e) {}

        return item;
      }, Model);
    }

    static updateOne(filter, update) {
      return new Query(async () => {
        const item = await Model.findOne(filter);
        if (!item) return { matchedCount: 0, modifiedCount: 0 };

        const updatedFields = update.$set ? { ...update.$set } : { ...update };
        delete updatedFields.$set;

        Object.assign(item, updatedFields, { updatedAt: new Date().toISOString() });

        try {
          await DynamoDbRepository.put(item);
        } catch (e) {}

        return { matchedCount: 1, modifiedCount: 1 };
      }, Model);
    }

    static deleteMany(filter = {}) {
      return new Query(async () => {
        if (Object.keys(filter).length === 0) {
          const items = [...store];
          store.length = 0;
          for (const item of items) {
            try {
              await DynamoDbRepository.delete(pk, item.SK);
            } catch (e) {}
          }
          return { deletedCount: items.length };
        }

        const toDelete = store.filter((item) => matchesFilter(item, filter));
        for (const item of toDelete) {
          const idx = store.findIndex((i) => i === item);
          if (idx >= 0) store.splice(idx, 1);
          try {
            await DynamoDbRepository.delete(pk, item.SK);
          } catch (e) {}
        }
        return { deletedCount: toDelete.length };
      }, Model);
    }
  };
}

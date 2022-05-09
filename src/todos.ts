import * as DB from 'worktop/kv';
import { ulid } from 'worktop/utils';
import type { ULID } from 'worktop/utils';
import type { KV } from 'worktop/kv';


export default function globals(env){

const kv = env.kv
//method of filtering and sorting occurs by key text in KV store, so we can only sort by completed status as it comes first
//we may also filter by createdAt field, but we have to run two operations guessing completed status if we must
const toPrefix = (completed: boolean) => `todo::${completed}::`;
const toKeyname = (completed: boolean, createdAt: number) => toPrefix(completed) + createdAt;

 async function list(completed?: boolean, options: { limit?: number; page?: number } = {limit: 1000}): Promise<string[]> {
	const prefix = toPrefix(completed);
	const keys = await DB.paginate<string[]>(kv, { ...options, prefix: typeof completed != 'undefined'? prefix: '' });
	
	//some of the kv data is embedded as key text, so it's appended to actual value- todo text.
	return Promise.all(keys.map(x => x.substring(6)).map(async x=>{
		const keys = x.split('::')
		return {completed: keys[0] == 'true', ...(await find(keys[1])), createdAt: keys[1]*1}
	  }))
}

 function save({createdAt, completed, val}) {
	const key = toKeyname(completed, createdAt);
	return DB.write(kv, key, {val});
}

 async function find(createdAt) {
	//KV store can't filter by affix, and with completed status coming first, we just have perform two operations when searching by createdAt
	const key = toKeyname(true, createdAt);
	const key2 = toKeyname(false, createdAt)
	const res1 = await DB.read(kv, key, 'json')
	return res1? res1 : DB.read(kv, key2, 'json')
}


 async function insert(item) {
		if (await save({completed: false, ...item})) {
            return true
        } else {
            throw new Error('no insert completed' + JSON.stringify(item))
        }

}


 function destroy({createdAt, completed}) {
	const key = toKeyname(completed, createdAt);
	return DB.remove(kv, key);
}


return {destroy, save, insert, find, list}
}

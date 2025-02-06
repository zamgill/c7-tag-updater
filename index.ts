import { argv, env } from 'bun';
import * as sql from 'mssql';
import { z } from 'zod';
import Commerce7Api, { type UpdateTagReqBody } from './lib/commerce7-client';

const title = argv[2];
if (!title || title.trim() == '') {
  throw new Error('Missing title argument. Exiting...');
}

const c7Api = new Commerce7Api();

const schema = z.object({
  id: z.number(),
  name: z.string(),
  tenantId: z.string(),
  updateTagId: z.string(),
});

type AccountDto = {
  id: number;
  name: string;
  tenantId: string;
  updateTagId: string;
};

// get account from db that have updateTagId
await sql.connect(env.CONNECTION_STRING);
const result = await sql.query<AccountDto[]>`
select ca.id                                                                 as id,
       ca.customer_account_name                                              as name,
       json_value(ca.config_json, '$.ExternalSystem.Properties.tenantId')    as tenantId,
       json_value(ca.config_json, '$.ExternalSystem.Properties.updateTagId') as updateTagId
from dbo.Customer_Account ca
where json_value(ca.config_json, '$.ExternalSystem.Id') = 2
  and json_value(ca.config_json, '$.ExternalSystem.Properties.updateTagId') is not null
order by ca.customer_account_name;
`;

type TAccount = z.infer<typeof schema>;
const accounts: TAccount[] = [];
for (const account of result.recordset) {
  const res = schema.parse(account);
  accounts.push(res);
}

// for each account, update the tag using tenant id
const updatePromises: Promise<any>[] = [];
const updatedTag: UpdateTagReqBody = {
  title,
  type: 'Manual',
};

for (const account of accounts) {
  const promise = c7Api.updateOrderTag(
    account.tenantId,
    account.updateTagId,
    updatedTag
  );
  updatePromises.push(promise);
}

Promise.all(updatePromises);
console.log('Tags updated!');

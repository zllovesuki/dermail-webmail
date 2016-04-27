# Database

```javascript
r.db('dermail').tableCreate('accounts', {
  primaryKey: 'accountId'
})
r.db('dermail').tableCreate('addresses', {
  primaryKey: 'addressId'
})
r.db('dermail').tableCreate('attachments', {
  primaryKey: 'attachmentId'
})
r.db('dermail').tableCreate('domains', {
  primaryKey: 'domainId'
})
r.db('dermail').tableCreate('folders', {
  primaryKey: 'folderId'
})
r.db('dermail').tableCreate('pushSubscriptions', {
  primaryKey: 'userId'
})
r.db('dermail').tableCreate('messageHeaders', {
  primaryKey: 'headerId'
})
r.db('dermail').tablseCreate('messages', {
  primaryKey: 'messageId'
})
r.db('dermail').tableCreate('queue', {
  primaryKey: 'queueId'
})
r.db('dermail').tableCreate('users', {
  primaryKey: 'userId'
})
r.db('dermail').tableCreate('filters', {
  primaryKey: 'filterId'
})
```


1. Add secondary index of "username" to table "users"
2. Add secondary index of "userId" to table "accounts"
3. Add secondary index of "accountId" to table "folders"
4. Add secondary index of "accountId" to table "messages"
5. Add secondary index of "userId" to table "queue"
6. Add secondary index of "accountId" to table "filters"


compound index of folderId + date in table "messages"
```javascript
r.db('dermail').table('messages').indexCreate('folderDate', [ r.row('folderId'),  r.row('date')])
```

Add secondary index of "folderId" and "isRead" to table "messages" as "unreadCount"
```javascript
r.db('dermail').table('messages').indexCreate('unreadCount', [r.row('folderId'), r.row('isRead')])
```

user and account mapping in "accounts"
```javascript
r.db('dermail').table('accounts').indexCreate('userAccountMapping', [ r.row('userId'),  r.row('accountId')])
```

message and account mapping in "messages"
```javascript
r.db('dermail').table('messages').indexCreate('messageAccountMapping', [r.row('messageId'), r.row('accountId')])
```

account and folder mapping in "folders"
```javascript
r.db('dermail').table('folders').indexCreate('accountFolderMapping', [ r.row('accountId'),  r.row('folderId')])
```

module.exports = {
  oneUser: [{ user: { username: 'userOne' } }],
  twoUsers: [
    { user: { username: 'userOne' } },
    { user: { username: 'userTwo' } },
  ],
  oneUserAdd: `
<user_group>
    <user_additions>
        <user>
            <username>userOne</username>
        </user>
    </user_additions>
</user_group>`,
  twoUsersAdd: `
<user_group>
    <user_additions>
        <user>
            <username>userOne</username>
        </user>
    </user_additions>
    <user_additions>
        <user>
            <username>userTwo</username>
        </user>
    </user_additions>
</user_group>`,
  oneUserDelete: `
<user_group>
    <user_deletions>
        <user>
            <username>userOne</username>
        </user>
    </user_deletions>
</user_group>`,
  twoUsersDelete: `
<user_group>
    <user_deletions>
        <user>
            <username>userOne</username>
        </user>
    </user_deletions>
    <user_deletions>
        <user>
            <username>userTwo</username>
        </user>
    </user_deletions>
</user_group>`,
  createUser: `
  <user>
    <name>fakeUserId</name>
    <full_name>Mx. Fake User Name</full_name>
    <email>fakeUserId@fake.org</email>
    <email_address>fakeUserId@fake.org</email_address>
    <position>Fake Jamf User Group</position>
  </user>`,
};

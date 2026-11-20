# Replaceable infrastructure adapters (reserved for later issues)

The original prototype's HTTP-fetch-to-own-API service singletons and per-call MongoClient helpers are not reused. Infrastructure adapters may implement **domain-owned ports** when their feature's authorization, validation, privacy and billing gates are satisfied. No production adapter, secret, database client or provider activation is included in Issue 1.

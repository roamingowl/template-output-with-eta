# Releasing new version

In local env on master run:
```bash
# tag the nev version
git tag v1.2.3
#update vX (for example v1) tag if necessary
git tag -d v1
git push --delete origin v1
git tag v1
git push origin --tags
```
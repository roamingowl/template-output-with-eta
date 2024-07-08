# Releasing a new version of this action

In local env on `main` run:
```bash
# tag the nev version
git tag v1.2.3
#update vX (for example v1) tag if necessary
git tag -d v1
git push --delete origin v1
git tag v1
git push origin --tags
```

Then open [new release page](https://github.com/roamingowl/template-output-with-eta/releases/new) in GitHub, 
and follow the instructions.
# travis-after-all

[![Build Status](https://travis-ci.org/alrra/travis-after-all.svg)](https://travis-ci.org/alrra/travis-after-all)
[![devDependency Status](https://david-dm.org/alrra/travis-after-all/dev-status.svg)](https://david-dm.org/alrra/travis-after-all#info=devDependencies)

`travis-after-all` is a simple script that can help you execute
code only once in a [build matrix](http://docs.travis-ci.com/user/customizing-the-build/#Build-Matrix)
based on whether the build has succeeded or failed.

Or to put it in another way, `travis-after-all` is basically a
temporary workaround for: [travis-ci/travis-ci#929](https://github.com/travis-ci/travis-ci/issues/929).


## Usage

__[1]__ Include the command that executes the `travis-after-all`
  script inside [`after_script`](http://docs.travis-ci.com/user/customizing-the-build/#The-Build-Lifecycle)
  (or inside of a script that is included inside `after_script`).

__[2]__ Based on the exit code of `travis-after-all`, run your
  custom code

See [examples](#usage-examples).

--

Exit codes meaning:

* `0` - the job that gets this exit code is the one assigned to run the
  code if the build succeeded

* `1` - the job that gets this exit code is the one assigned to run the
  code if the build failed

* other - job was not assigned to do anything

--

Terminology:

* a __job passed__ if either the tests passed or the tests failed but
  the job was [allowed to fail](http://docs.travis-ci.com/user/customizing-the-build/#Rows-that-are-Allowed-To-Fail)

* a __build succeeded__ if all jobs passed and there is at least one
  job who's tests passed

* a __build failed__ if there is at least one job who didn't pass, or
  if all jobs passed but for all of them the tests failed


## Usage examples

### Using `npm`

Install `travis-afer-all` as a `devDependency`:

 ```bash
npm install --save-dev travis-after-all
```

then, in your `.travis.yml` file, add:

```bash

# ...

after_script:
  - |

      declare exitCode;


      # -- [1] -------------------------------------------------------

      # Make the `travis-after-all` command available
      npm link

      travis-after-all
      exitCode=$?


      # -- [2] -------------------------------------------------------

      if [ $exitCode -eq 0 ]; then
        # Here goes the code that needs to be executed if the build succeeded
      fi

      if [ $exitCode -eq 1 ]; then
        # Here goes the code that needs to be executed if the build failed
      fi


# ...

```


### General usage

In your `.travis.yml` file add:

```bash

# ...

after_script:
  - |

      declare exitCode


      # -- [1] -------------------------------------------------------

      curl -sSL https://raw.githubusercontent.com/alrra/travis-after-all/master/travis-after-all.js | node
      exitCode=$?


      # -- [2] -------------------------------------------------------

      if [ $exitCode -eq 0 ]; then
        # Here goes the code that needs to be executed if the build succeeded
      fi

      if [ $exitCode -eq 1 ]; then
        # Here goes the code that needs to be executed if the build failed
      fi

# ...

```

__Note:__ `travis-after-all` is written in JavaScript, however, since
Travis [includes the Node runtime by default](http://docs.travis-ci.com/user/ci-environment/#Runtimes),
it can be use no matter what [build environment](http://docs.travis-ci.com/user/ci-environment/)
you use.


## License

The code is available under the [MIT license](LICENSE.txt).

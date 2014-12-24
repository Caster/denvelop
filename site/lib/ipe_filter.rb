# Based on http://nanoc.ws/docs/extending-nanoc/#writing-filters and
# https://github.com/blinry/blog-morr-cc and
# http://stackoverflow.com/a/5970819/962603 for Open3 calling syntax.
class IpeFilter < Nanoc::Filter
    require "open3"
    identifier :ipe
    type :binary

    def run(filename, params={})
        Open3.popen3('iperender',
                     '-svg',
                     filename,
                     output_filename) do |stdin, stdout, stderr, wait_thr|
            stdin.close
            stdout.gets(nil)
            stdout.close
            stderr.gets(nil)
            stderr.close
            exit_code = wait_thr.value
            if exit_code != 0
                raise "IpeRender returned non-zero exitcode #{exit_code}."
            end
        end
    end
end

class LessFilter < Nanoc::Filter
  require 'open3'

  identifier :less
  type :binary => :text

  def run(filename, params = {})
    output, exit_code = Open3.capture2e('lessc', filename)
    if exit_code != 0
      puts output
      raise "lessc returned non-zero exitcode #{exit_code}"
    end
    output
  end
end

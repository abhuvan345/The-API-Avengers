import React, { useState } from "react";
import { ArrowLeft, Phone, Lock, Sprout, Eye, EyeOff } from "lucide-react";
import authService from "../services/authService";
import { useLanguage } from "../hooks/useLanguage";
import LanguageDropdown from "./LanguageDropdown";

interface SignInPageProps {
  onSuccess: (userData: {
    id: number;
    phone: string;
    gmail: string;
    username: string;
    name: string;
  }) => void;
  onBack: () => void;
  onSignUp: () => void;
}

const SignInPage: React.FC<SignInPageProps> = ({
  onSuccess,
  onBack,
  onSignUp,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    identifier: "", // phone, email, or username
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate inputs
      const newErrors: { [key: string]: string } = {};

      if (!formData.identifier.trim()) {
        newErrors.identifier = t("auth.signIn.errors.identifierRequired");
      }

      if (!formData.password.trim()) {
        newErrors.password = t("auth.signIn.errors.passwordRequired");
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      // Attempt login
      const result = await authService.signin({
        identifier: formData.identifier,
        password: formData.password,
      });

      if (result.success) {
        onSuccess(result.user);
      } else {
        setErrors({ general: result.error || t("auth.signIn.genericError") });
      }
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : t("auth.signIn.genericErrorRetry"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      {/* Language Dropdown */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageDropdown />
      </div>

      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center text-green-700 hover:text-green-800 mb-6 text-lg font-medium"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          {t("common.back")}
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-full">
                <Sprout className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {t("auth.signIn.title")}
            </h2>
            <p className="text-green-100">{t("auth.signIn.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Phone/Email/Username Field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                {t("auth.signIn.phone")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.identifier}
                  onChange={(e) =>
                    handleInputChange("identifier", e.target.value)
                  }
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.identifier ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder={t("auth.signIn.phone")}
                  disabled={loading}
                />
              </div>
              {errors.identifier && (
                <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                {t("auth.signIn.password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`w-full pl-10 pr-12 py-3 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder={t("auth.signIn.password")}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? t("common.loading") : t("auth.signIn.submit")}
            </button>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-600">
                {t("auth.signIn.noAccount")}{" "}
                <button
                  type="button"
                  onClick={onSignUp}
                  className="text-green-600 hover:text-green-700 font-semibold"
                  disabled={loading}
                >
                  {t("auth.signIn.signUp")}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;

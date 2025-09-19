import React, { useState } from "react";
import {
  ArrowLeft,
  Phone,
  Mail,
  User,
  Lock,
  Sprout,
  Eye,
  EyeOff,
} from "lucide-react";
import authService from "../services/authService";
import { useLanguage } from "../hooks/useLanguage";
import LanguageDropdown from "./LanguageDropdown";

interface SignUpPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSuccess, onBack }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    phone: "",
    gmail: "",
    username: "",
    password: "",
    name: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateGmail = (gmail: string): boolean => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(gmail);
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

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

      if (!validatePhone(formData.phone)) {
        newErrors.phone = t("auth.signUp.errors.phoneFormat");
      }

      if (!validateGmail(formData.gmail)) {
        newErrors.gmail = t("auth.signUp.errors.gmailFormat");
      }

      if (!formData.username.trim()) {
        newErrors.username = t("auth.signUp.errors.usernameRequired");
      }

      if (!formData.name.trim()) {
        newErrors.name = t("auth.signUp.errors.nameRequired");
      }

      if (!validatePassword(formData.password)) {
        newErrors.password = t("auth.signUp.errors.passwordFormat");
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      // Attempt signup
      const result = await authService.signup({
        phone: formData.phone,
        gmail: formData.gmail,
        username: formData.username,
        password: formData.password,
        name: formData.name,
      });

      if (result.success) {
        onSuccess();
      } else {
        setErrors({ general: result.error || "Signup failed" });
      }
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Signup failed. Please try again.",
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
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-full">
                <Sprout className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {t("auth.signUp.title")}
            </h2>
            <p className="text-green-100">{t("auth.signUp.title")}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                {t("auth.signUp.username")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder={t("auth.signUp.username")}
                  disabled={loading}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                {t("auth.signUp.phone")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    handleInputChange(
                      "phone",
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder={t("auth.signUp.phone")}
                  disabled={loading}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Gmail Field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.gmail}
                  onChange={(e) => handleInputChange("gmail", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.gmail ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="your.email@gmail.com"
                  disabled={loading}
                />
              </div>
              {errors.gmail && (
                <p className="mt-1 text-sm text-red-600">{errors.gmail}</p>
              )}
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                {t("auth.signUp.username")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.username ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder={t("auth.signUp.username")}
                  disabled={loading}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                {t("auth.signUp.password")}
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
                  placeholder="Create a strong password"
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
              <p className="mt-1 text-xs text-gray-500">
                Must be 8+ characters with uppercase, lowercase, number &
                special character
              </p>
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
              {loading ? t("common.loading") : t("auth.signUp.submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
